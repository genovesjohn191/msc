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
  CommonDefinition
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { SystemMessageForm } from './system-message-form';

const SYSTEM_MESSAGE_DATEFORMAT = 'YYYY-MM-DDTHH:mm';
const SYSTEM_MESSAGE_TIMEZONE_FORMAT = "yyyy-MM-dd'T'HH:mm z";
const SYSTEM_MESSAGE_ISO_DATEFORMAT = 'isoDate';
@Component({
  selector: 'mcs-system-message-form',
  templateUrl: './system-message-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SystemMessageFormComponent
  implements OnInit, OnDestroy, IMcsFormGroup, IMcsDataChange<SystemMessageForm> {

  public dateNow = new Date();
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

  @ViewChild(McsFormGroupDirective)
  public _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _systemMessageForm = new SystemMessageForm();

  constructor(
    private _formBuilder: FormBuilder,
    private _dateTimeService: McsDateTimeService,
    private _translateService: TranslateService
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
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    this._systemMessageForm.start = this._serializeSystemMessageDate(this.fcStart.value);
    this._systemMessageForm.expiry = this._serializeSystemMessageDate(this.fcExpiry.value);
    this._systemMessageForm.type = this.fcType.value;
    this._systemMessageForm.severity = this.fcSeverity.value;
    this._systemMessageForm.message = this.fcMessage.value;
    this._systemMessageForm.enabled = this.fcEnabled.value;
    this._systemMessageForm.valid = this.fgCreateMessage.valid;

    this._setSystemMessageHasChangedFlag();

    // Emit changes
    this.dataChange.emit(this._systemMessageForm);
  }

  /**
   * Returns the message type enumeration instance
   */
  public get messageTypeEnum(): any {
    return MessageType;
  }

  /**
   * Sets the severity form control property
   */
  private _setSeverityFormControl() {
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
      ),
      CoreValidators.custom(
        this._earlierDateValidation.bind(this),
        'invalidEarlierDate'
      ),
      CoreValidators.custom(
        this._startDateValidation.bind(this),
        'invalidStartDate'
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
      ),
      CoreValidators.custom(
        this._expiryDateValidation.bind(this),
        'invalidExpiryDate'
      ),
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

    this._setFormControlValues();

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
    this.fgCreateMessage.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());
  }

  private _onStartAndExpiryChange(): void {
    // Check individual
    let expiryDate = getSafeProperty(this.fcExpiry, (obj) => obj.value);
    if (isNullOrEmpty(expiryDate)) {
      this.fcStart.setErrors(null);
      return;
    }

    let startDate = getSafeProperty(this.fcStart, (obj) => obj.value);
    if (isNullOrEmpty(startDate)) {
      this.fcExpiry.setErrors(null);
      return;
    }

    // Compare both start and expiry date
    let comparisonResult = compareDates(new Date(startDate), new Date(expiryDate));
    if (comparisonResult < 0) {
      this.fcStart.setErrors(null);
      this.fcExpiry.setErrors(null);
    }
  }

  /**
   * Sets the values of form controls when message is on edit
   */
  private _setFormControlValues(): void {
    if (isNullOrEmpty(this.message)) { return; }

    this.fcStart.setValue(this._dateTimeService.formatDate(
      this.message.start,
      SYSTEM_MESSAGE_ISO_DATEFORMAT,
      CommonDefinition.TIMEZONE_SYDNEY));

    this.fcExpiry.setValue(this._dateTimeService.formatDate(
      this.message.expiry,
      SYSTEM_MESSAGE_ISO_DATEFORMAT,
      CommonDefinition.TIMEZONE_SYDNEY));

    this.fcType.setValue(this.message.type);
    this.fcSeverity.setValue(this.message.severity);
    this.fcEnabled.setValue(this.message.enabled);
    this.fcMessage.setValue(this.message.message);
    this.hasEditedMessage = true;
  }

  /**
   * Serialize start and expiry date of system message
   * @param date Date to be serialize
   */
  private _serializeSystemMessageDate(date: string): string {
    if (isNullOrEmpty(date)) { return ''; }
    if (!isNaN(Date.parse(date))) {
      let datetime = this._dateTimeService.formatDateString(
        date,
        SYSTEM_MESSAGE_TIMEZONE_FORMAT,
        CommonDefinition.TIMEZONE_SYDNEY
      );
      return datetime;
    }
    return date;
  }

  /**
   * Form groups and Form controls registration area
   */
  private _setSystemMessageHasChangedFlag() {
    if (isNullOrEmpty(this.message)) { return; }

    let startHasChanged = this.fcStart.value !== this._dateTimeService.formatDate(
      getSafeProperty(this.message, (obj) => obj.start, ''),
      SYSTEM_MESSAGE_ISO_DATEFORMAT,
      CommonDefinition.TIMEZONE_SYDNEY);

    let expiryHasChanged = this.fcExpiry.value !== this._dateTimeService.formatDate(
      getSafeProperty(this.message, (obj) => obj.expiry, ''),
      SYSTEM_MESSAGE_ISO_DATEFORMAT,
      CommonDefinition.TIMEZONE_SYDNEY);

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
    return (!isNaN(Date.parse(date)));
  }

  /**
   * Returns true when date format of start and expiry is valid
   * based on the given format
   * @param date Inputted value from input box
   */
  private _dateFormatValidation(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    return (this._dateTimeService.isDateFormatValid(date, SYSTEM_MESSAGE_DATEFORMAT));
  }

  /**
   * Returns true when date is not earlier than present time
   * @param date Inputted value from input box
   */
  private _earlierDateValidation(date: string): boolean {
    if (isNullOrEmpty(date)) { return true; }
    return compareDates(new Date(date), this.dateNow) >= 0;
  }

  /**
   * Returns true when start date is present date
   * but not later than expiry date
   * @param startDate Inputted value from input box
   */
  private _startDateValidation(startDate: string): boolean {
    if (isNullOrEmpty(startDate)) { return true; }
    let expiryDate = getSafeProperty(this.fcExpiry, (obj) => obj.value);
    return compareDates(new Date(startDate), new Date(expiryDate)) < 0;
  }

  /**
   * Returns true when expiry date is present date or later the start date
   * @param expiryDate Inputted value from input box
   */
  private _expiryDateValidation(expiryDate: string): boolean {
    if (isNullOrEmpty(expiryDate)) { return true; }
    let startDate = getSafeProperty(this.fcStart, (obj) => obj.value);
    return compareDates(new Date(startDate), new Date(expiryDate)) < 0;
  }

}
