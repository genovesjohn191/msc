import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  Input
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  merge
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsFormGroup,
  IMcsDataChange,
  McsDateTimeService
} from '@app/core';
import {
  McsOption,
  messageTypeText,
  MessageType,
  severityText,
  Severity,
  McsSystemMessage,
} from '@app/models';
import {
  isNullOrEmpty,
  compareDates,
  unsubscribeSafely,
  getSafeProperty,
  getCurrentDate,
  CommonDefinition
} from '@app/utilities';
import {
  McsFormGroupDirective,
  FormMessage
} from '@app/shared';
import { SystemMessageForm } from './system-message-form';

const SYSTEM_MESSAGE_DATE_FORMAT = `YYYY-MM-DD[T]HH:mm`;
const SYSTEM_MESSAGE_FORMAT_NAME = `isoDate`;

@Component({
  selector: 'mcs-system-message-form',
  templateUrl: './system-message-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageFormComponent
  implements OnInit, OnDestroy, IMcsFormGroup, IMcsDataChange<SystemMessageForm> {

  public hasEditedMessage: boolean;

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

  @Input()
  public message: McsSystemMessage;

  @Output()
  public dataChange = new EventEmitter<SystemMessageForm>();

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  @ViewChild('formMessage', { static: false })
  private _formMessage: FormMessage;

  private _isValidDates: boolean = true;
  private _destroySubject = new Subject<void>();
  private _systemMessageForm = new SystemMessageForm();

  constructor(
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _dateTimeService: McsDateTimeService
  ) {
    this.messageTypeList = new Array();
    this.severityList = new Array();
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._setMessageTypeList();
    this._setSeverityList();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get messageContextualHelp(): string {
    return isNullOrEmpty(this.message) ?
      this._translateService.instant('systemMessageForm.messageCreateHelp') :
      this._translateService.instant('systemMessageForm.messageEditHelp');
  }

  /**
   * Returns the message type enumeration instance
   */
  public get messageTypeEnum(): any {
    return MessageType;
  }

  /**
   * Returns the formatted current date timezone
   */
  public get dateNow(): Date {
    return getCurrentDate();
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
    return getSafeProperty(this.fgCreateMessage, (obj) => obj.valid) && this._isValidDates;
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    this._systemMessageForm.start = (isNullOrEmpty(this.fcStart.value)) ? '' : new Date(this.fcStart.value).toUTCString();
    this._systemMessageForm.expiry = (isNullOrEmpty(this.fcExpiry.value)) ? '' : new Date(this.fcExpiry.value).toUTCString();
    this._systemMessageForm.type = this.fcType.value;
    this._systemMessageForm.severity = this.fcSeverity.value;
    this._systemMessageForm.message = this.fcMessage.value;
    this._systemMessageForm.enabled = this.fcEnabled.value;
    this._systemMessageForm.valid = this.fgCreateMessage.valid && this._isValidDates;

    this._setSystemMessageHasChangedFlag();

    // Emit changes
    this.dataChange.emit(this._systemMessageForm);
  }

  /**
   * Sets the severity form control property
   */
  private _setSeverityFormControl(): void {
    if (isNullOrEmpty(this.fgCreateMessage)) { return; }

    (this.fcType.value === this.messageTypeEnum.Info) ?
      this.fgCreateMessage.removeControl('fcSeverity') :
      this.fgCreateMessage.setControl('fcSeverity', this.fcSeverity);

    let hasSeverity = !isNullOrEmpty(this.message) && this.fgCreateMessage.get('fcSeverity');
    if (hasSeverity) {
      this.fcSeverity.setValue(this.message.severity);
    }
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcStart = new FormControl('', [
      CoreValidators.custom(
        this._formControlDateValidation.bind(this),
        'invalidDate'
      ),
      CoreValidators.custom(
        this._dateFormatValidation.bind(this),
        'invalidDateFormat'
      )
    ]);

    this.fcExpiry = new FormControl('', [
      CoreValidators.custom(
        this._formControlDateValidation.bind(this),
        'invalidDate'
      ),
      CoreValidators.custom(
        this._dateFormatValidation.bind(this),
        'invalidDateFormat'
      ),
      CoreValidators.custom(
        this._earlierDateValidation.bind(this),
        'invalidEarlierDate'
      )
    ]);

    this.fcType = new FormControl('', [
    ]);

    this.fcSeverity = new FormControl(null, [
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

    this.fcType.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(() => this._setSeverityFormControl())
    ).subscribe();

    merge(this.fcStart.valueChanges, this.fcExpiry.valueChanges).pipe(
      takeUntil(this._destroySubject),
      tap(() => this._onStartAndExpiryChange())
    ).subscribe();

    // Create form group and bind the form controls
    this.fgCreateMessage.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(() => this.notifyDataChange())
    ).subscribe();

    this._setFormControlValues();
  }

  /**
   * Validates the error validation on start and expiry changes
   */
  private _onStartAndExpiryChange(): void {
    // Check individual
    let expiryDate = getSafeProperty(this.fcExpiry, (obj) => obj.value);
    let startDate = getSafeProperty(this.fcStart, (obj) => obj.value, this.dateNow);

    if (isNullOrEmpty(this._formMessage)) { return; }
    this._setFormMessageConfiguration();

    if (this.fcStart.invalid || this.fcExpiry.invalid) {
      this._formMessage.hideMessage();
      return;
    }

    this._isValidDates = this.hasPassedDateValidation(startDate, expiryDate, this.dateNow.toString());
    if (!this._isValidDates) {
      this._formMessage.showMessage('error', {
        messages: this._translateService.instant('systemMessageForm.errors.messageDates')
      });
      return;
    }

    this._formMessage.hideMessage();

  }

  /**
   * Sets the values of form controls when message is on edit
   */
  private _setFormControlValues(): void {
    if (isNullOrEmpty(this.message)) { return; }

    this.fcStart.setValue(this._dateTimeService.formatDate(this.message.start,
                                                          SYSTEM_MESSAGE_FORMAT_NAME));
    this.fcExpiry.setValue(this._dateTimeService.formatDate(this.message.expiry,
                                                          SYSTEM_MESSAGE_FORMAT_NAME));

    this.fcType.setValue(this.message.type);
    this.fcSeverity.setValue(this.message.severity);
    this.fcEnabled.setValue(this.message.enabled);
    this.fcMessage.setValue(this.message.message);
    this.hasEditedMessage = true;
  }

  /**
   * Set the dismiss button of form message to hidden
   */
  private _setFormMessageConfiguration(): void {
    this._formMessage.updateConfiguration({
      hideDismissButton: true
    });
  }

  /**
   * Sets the value of system message hasChange property
   */
  private _setSystemMessageHasChangedFlag() {
    if (isNullOrEmpty(this.message)) { return; }

    let startHasChanged = this.fcStart.value !== getSafeProperty(this.message, (obj) => obj.start, '');

    let expiryHasChanged = this.fcExpiry.value !== getSafeProperty(this.message, (obj) => obj.expiry, '');

    this._systemMessageForm.hasChanged = this._systemMessageForm.valid &&
      (this.fcEnabled.value !== this.message.enabled || startHasChanged || expiryHasChanged
        || this.fcSeverity.value !== this.message.severity || this.fcType.value !== this.message.type);
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
   * Returns true when date inputted for start and expiry is valid
   * @param date Inputted value from input box
   */
  private _formControlDateValidation(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    return !isNaN(Date.parse(date));
  }

  /**
   * Returns true when date format of start and expiry is valid
   * based on the given format
   * @param date Inputted value from input box
   */
  private _dateFormatValidation(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    return this._dateTimeService.isDateFormatValid(date, SYSTEM_MESSAGE_DATE_FORMAT);
  }

  /**
   * Returns true when date is not earlier than present time
   * @param date Inputted value from input box
   */
  private _earlierDateValidation(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    let isEarlierDate = compareDates(new Date(date), new Date(this.dateNow)) <= 0;
    return !isEarlierDate;
  }

  /**
   * Returns true when inputted date is greater than present date
   * @param date Inputted date of system message
   * @param presentDate Current Date Timezone
   */
  private isGreaterThanPresentDate(date: string, presentDate?: string): boolean {
    if (isNullOrEmpty(date)) { return false; }
    if (isNullOrEmpty(presentDate)) { presentDate = this.dateNow.toString(); }

    let comparisonResult = compareDates(new Date(date), new Date(presentDate)) > 0;
    return comparisonResult;
  }

  /**
   * Returns true when passed all conditions for date validation
   * @param startDate Start date of system message
   * @param expiryDate Expiry date of system message
   * @param presentDate Current date timezone
   */
  private hasPassedDateValidation(startDate: string, expiryDate: string, presentDate?: string): boolean {
    if (isNullOrEmpty(expiryDate)) { return true; }
    if (isNullOrEmpty(startDate)) { startDate = this.dateNow.toString(); }
    if (isNullOrEmpty(presentDate)) { presentDate = this.dateNow.toString(); }

    let isStartLessExpiry = compareDates(new Date(startDate), new Date(expiryDate)) < 0;
    let isValidExpiry = this.isGreaterThanPresentDate(expiryDate, presentDate);
    return isStartLessExpiry && isValidExpiry;
  }

}
