import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsFormGroup,
  IMcsDataChange
} from '@app/core';
import {
  McsOption,
  messageTypeText,
  MessageType,
  severityText,
  Severity,
} from '@app/models';
import {
  isNullOrEmpty,
  compareDates,
  unsubscribeSubject,
  getSafeProperty
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { SystemMessageForm } from './system-message-form';

@Component({
  selector: 'mcs-system-message-form',
  templateUrl: './system-message-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageFormComponent
  implements OnInit, OnDestroy, IMcsFormGroup, IMcsDataChange<SystemMessageForm> {

  public dateNow = new Date();

  // Form Variables
  public fgCreateMessage: FormGroup;
  public fcStart: FormControl;
  public fcExpiry: FormControl;
  public fcType: FormControl;
  public fcSeverity: FormControl;
  public fcMessage: FormControl;
  public fcEnabled: FormControl;

  // System Message Dropdowns
  public messageTypeList: McsOption[];
  public severityList: McsOption[];

  @Output()
  public dataChange = new EventEmitter<SystemMessageForm>();

  @ViewChild(McsFormGroupDirective)
  public _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _systemMessageForm = new SystemMessageForm();

  constructor(
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.messageTypeList = new Array ();
    this.severityList = new Array ();
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._onFormChanges();
    this._setMessageTypeList();
    this._setSeverityList();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this.fgCreateMessage, (obj) => obj.valid);
  }

  /**
   * Checks the validation of expiry date
   * form control when there is a change on
   * start date form control
   */
  public updateExpiryValidation(): void {
    this.fcExpiry.updateValueAndValidity();
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    this._systemMessageForm.start = this.fcStart.value;
    this._systemMessageForm.expiry = this.fcExpiry.value;
    this._systemMessageForm.type = this.fcType.value;
    this._systemMessageForm.severity = this.fcSeverity.value;
    this._systemMessageForm.message = this.fcMessage.value;
    this._systemMessageForm.enabled = this.fcEnabled.value;

    // Emit changes
    this.dataChange.emit(this._systemMessageForm);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcStart = new FormControl('', [
      CoreValidators.custom(
        this._isValidDate.bind(this),
        'invalidDateFormat'
      ),
      CoreValidators.custom(
        this._isValidStart.bind(this),
        'invalidStartDate'
      ),
    ]);

    this.fcExpiry = new FormControl('', [
      CoreValidators.custom(
        this._isValidDate.bind(this),
        'invalidDateFormat'
      ),
      CoreValidators.custom(
        this._isValidExpiry.bind(this),
        'invalidExpiryDate'
      ),
    ]);

    this.fcType = new FormControl('', [
    ]);

    this.fcSeverity = new FormControl('', [
    ]);

    this.fcMessage = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcEnabled = new FormControl(true, [
    ]);

    // Register Form Groups using binding
    this.fgCreateMessage = this._formBuilder.group({
      fcStart: this.fcStart,
      fcExpiry: this.fcExpiry,
      fcType: this.fcType,
      fcSeverity: this.fcSeverity,
      fcMessage: this.fcMessage,
      fcEnabled: this.fcEnabled
    });

    // Create form group and bind the form controls
    this.fgCreateMessage.statusChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());
  }

  /**
   * Detects any form field changes and
   * execute the notify data change
   */
  private _onFormChanges(): void {
    this.fgCreateMessage.valueChanges.subscribe(() => {
      this.notifyDataChange();
    });
  }

  /**
   * Set message type based on selection
   */
  private _setMessageTypeList(): void {
    if (isNullOrEmpty(messageTypeText)) { return; }

    this.messageTypeList.push(new McsOption(MessageType.Info,
      messageTypeText[MessageType.Info]));
    this.messageTypeList.push(new McsOption(MessageType.Alert,
      messageTypeText[MessageType.Alert]));
  }

  /**
   * Set severity based on selection
   */
  private _setSeverityList(): void {
    if (isNullOrEmpty(severityText)) { return; }

    this.severityList.push(new McsOption(Severity.Low,
      severityText[Severity.Low]));
    this.severityList.push(new McsOption(Severity.Medium,
      severityText[Severity.Medium]));
    this.severityList.push(new McsOption(Severity.High,
      severityText[Severity.High]));
    this.severityList.push(new McsOption(Severity.Critical,
      severityText[Severity.Critical]));
  }

  /**
   * Returns true when date is valid
   * @param date Inputted value from input box
   */
  private _isValidDate(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    return (!isNaN(Date.parse(date)));
  }

  /**
   * Returns true when date is present or later date
   * @param startDate Inputted value from input box
   */
  private _isValidStart(startDate: string): boolean {
    if (isNullOrEmpty(startDate)) { return true; }
    return compareDates(new Date(startDate), this.dateNow) >= 0;
  }

  /**
   * Returns true when date is present or later than start date
   * @param expiryDate Inputted value from input box
   */
  private _isValidExpiry(expiryDate: string): boolean {
    if (isNullOrEmpty(expiryDate)) { return true; }
    const comparedDates: number = compareDates(new Date(expiryDate), new Date(this.fcStart.value));
    return (comparedDates > 0 || isNullOrEmpty(this.fcStart.value));
  }

}
