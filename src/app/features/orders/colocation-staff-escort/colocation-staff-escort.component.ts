import {
  forkJoin,
  of,
  throwError,
  zip,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  filter,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  McsAuthenticationIdentity,
  McsDateTimeService,
  McsOrderWizardBase,
  OrderRequester,
  SwitchAccountService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { OrderDetails } from '@app/features-shared';
import {
  colocationEscorteeText,
  ColocationEscortee,
  DeliveryType,
  McsAccount,
  McsCompany,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsServiceBase,
  OrderIdType,
  RouteKey,
  HttpStatusCode
} from '@app/models';
import { McsOrderColocationStaffEscort } from '@app/models/request/mcs-order-colocation-staff-escort';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  addMonthsToDate,
  createObject,
  formatStringToPhoneNumber,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  pluck,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  addHoursToDate,
  compareDates,
  formatStringToText
} from '@app/utilities';

import { ColocationStaffEscortService } from './colocation-staff-escort.service';

const COLOCATION_STAFF_ESCORT = Guid.newGuid().toString();
const TEXTAREA_MAXLENGTH_DEFAULT = 850;
const MAX_DATE = addMonthsToDate(getCurrentDate(), 12);
const STEP_HOUR: number = 1;
const STEP_MINUTE: number = 30;
const ARRIVAL_TIME_MAX = '23:30';
const ARRIVAL_TIME_MIN_DEFAULT = '00:00';
const LOADING_TEXT = 'loading';
interface IRackService {
  serviceId: string
  name: string;
  description: string;
  colocationGroup: string;
}

@Component({
  selector: 'mcs-order-colocation-staff-escort',
  templateUrl: 'colocation-staff-escort.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ColocationStaffEscortService]
})

export class ColocationStaffEscortComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgColocationStaffEscortDetails: FormGroup;
  public fcColocationService: FormControl;
  public fcEscortee: FormControl;
  public fcName: FormControl;
  public fcOrganization: FormControl;
  public fcJobTitle: FormControl;
  public fcMobile: FormControl;
  public fcEmail: FormControl;
  public fcAttendanceDate: FormControl;
  public fcArrivalTime: FormControl;
  public fcExitTime: FormControl;
  public fcRackIdentifier: FormControl;
  public fcWorkToPerform: FormControl;
  public fcToolsRequired: FormControl;
  public fcReason: FormControl;
  public fcReferenceNumber: FormControl;
  public colocationRacks$: Observable<McsServiceBase[]>;
  public colocationAntennas$: Observable<McsServiceBase[]>;
  public colocationCustomDevices$: Observable<McsServiceBase[]>;
  public colocationRooms$: Observable<McsServiceBase[]>;
  public colocationStandardSqMs$: Observable<McsServiceBase[]>;
  public escorteeOptions$: Observable<McsOption[]>;
  public colocationGroups: McsOptionGroup[] = [];
  public hasServiceToDisplay: boolean;
  public loadingInProgress: boolean;
  public minAttendanceDateTime: Date;
  public minArrivalTime: string;
  public minExitTime: string;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _selectedRackServiceHandler: Subscription;
  private _userAccount: McsAccount = new McsAccount();
  private _company: McsCompany = new McsCompany();
  private _errorStatus: number;

  constructor(
    _injector: Injector,
    private _colocationStaffEscortService: ColocationStaffEscortService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _switchAccountService: SwitchAccountService,
    private _changeDetector: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _dateTimeService: McsDateTimeService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    super(
      _colocationStaffEscortService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'colocation-staff-escort-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._updateOnCompanySwitch();
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._getUserIdentityAndAccountDetails();
    this._getEscorteeOptions();
    this._getRackServices();
    this._setEarliestAttendanceDateTime();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedRackServiceHandler);
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesFallbackText(): string {
    if (this.hasServiceToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get defaultMaxlength(): number {
    return TEXTAREA_MAXLENGTH_DEFAULT;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get escorteeEnum(): typeof ColocationEscortee {
    return ColocationEscortee;
  }

  public get minDate(): Date {
    if(isNullOrUndefined(this.minAttendanceDateTime)) { return }
    return this.minAttendanceDateTime;
  }

  public get maxDate(): Date {
    return MAX_DATE;
  }

  public get stepHour(): number {
    return STEP_HOUR;
  }

  public get stepMinute(): number {
    return STEP_MINUTE;
  }
  public get loadingText(): string {
    return LOADING_TEXT;
  }

  public get maxArrivalTime(): string {
    return ARRIVAL_TIME_MAX;
  }

  public get defaultArrivalTime(): string {
    if(isNullOrUndefined(this.minArrivalTime)) { return }
    return this.minArrivalTime;
  }

  public get defaultExitTime(): string {
    if(isNullOrUndefined(this.minExitTime)) { return }
    return this.minExitTime;
  }

  private _setEarliestAttendanceDateTime(){
    this.orderItemType$.subscribe(orderItemType => {
      if(!isNullOrUndefined(orderItemType.standardLeadTimeHours)) {
        this._setDefaultAttendanceDetails(orderItemType.standardLeadTimeHours);
      }
    });
  }

  private _setDefaultAttendanceDetails(standardLeadTimeHours: number) : void {
    // Compute and assign minimum arrival date and time
    let currentRoundedDateTime = this._roundTime(getCurrentDate());
    this.minAttendanceDateTime = addHoursToDate(currentRoundedDateTime, standardLeadTimeHours);
    this.minArrivalTime = this._dateTimeService.formatDate(this.minAttendanceDateTime, '24hourTime');

    // Compute and assign minimum exit time
    let minExitTime = this._dateTimeService.addMinutesToDate(this.minAttendanceDateTime, STEP_MINUTE);
    this.minExitTime = this._dateTimeService.formatDate(minExitTime, '24hourTime');

    // Set Attendance Detail Values
    this.fcAttendanceDate.setValue(this.minAttendanceDateTime);
    this.fcArrivalTime.setValue(this.minArrivalTime);
    this.fcExitTime.setValue(this.minExitTime);
  }

  private _roundTime(time: Date): Date {
    time.setMilliseconds(Math.ceil(time.getMilliseconds() / 1000) * 1000);
    time.setSeconds(Math.ceil(time.getSeconds() / 60) * 60);
    time.setMinutes(Math.ceil(time.getMinutes() / STEP_MINUTE) * STEP_MINUTE);
    return time;
  }

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  public isEscorteeSomeoneElse(escortee: ColocationEscortee): boolean {
    return escortee === ColocationEscortee.SomeoneElse;
  }

  private _updateOnCompanySwitch(): void {
    this._eventDispatcher.addEventListener(McsEvent.accountChange, () => {
      if (this.isImpersonating) {
        this.fcEscortee.setValue(ColocationEscortee.SomeoneElse);
        this.fcEscortee.updateValueAndValidity();
        this._subscribeToValueChanges();
      }
      this._changeDetector.markForCheck();
    });
  }

  public onEscorteeChange(escortee: ColocationEscortee): void {
    this._resetAttendeeFields();
    this._getUserIdentityAndAccountDetails();
    if (this.isEscorteeSomeoneElse(escortee) || this.isImpersonating) {
      this.fcName.enable();
      this.fcOrganization.enable();
      this.fcJobTitle.enable();
      this.fcMobile.enable();
      this.fcEmail.enable();
    } else {
      this.fcName.disable();
      this.fcOrganization.disable();
      this.fcJobTitle.disable();
      this.fcMobile.disable();
      this.fcEmail.disable();
    }
  }

  private _subscribeAttendanceDetailsChanges(){
    this.fcArrivalTime.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(() => {
        if(isNullOrEmpty(this.fcExitTime.value)){ return; }

        let exitTime = this._dateTimeService.formatTimeStringToDate(this.fcExitTime.value);
        let arrivalTime = this._dateTimeService.formatTimeStringToDate(this.fcArrivalTime.value);

        // Set new minimum exit time
        let minExitTime = this._dateTimeService.addMinutesToDate(arrivalTime, STEP_MINUTE);
        this.minExitTime = this._dateTimeService.formatDate(minExitTime, '24hourTime');

        if(compareDates(exitTime, arrivalTime) < 0){
          // Set new min exit time as fcExitTime value
          this.fcExitTime.setValue(this.minExitTime);
        }
      })
    ).subscribe();
  }

  public onDateChanged(selectedDate: string): void {
    if(compareDates(this.minAttendanceDateTime, new Date(selectedDate)) > 0) {
      // Set new minimum arrival time
      this.minArrivalTime = this._dateTimeService.formatDate(this.minAttendanceDateTime, '24hourTime');
      let currentArrivalTime = this._dateTimeService.formatTimeStringToDate(this.fcArrivalTime.value);

      if(compareDates(this.minAttendanceDateTime, currentArrivalTime) > 0) {
        // Set new min arrival time as fcArrivalTime value
        this.fcArrivalTime.setValue(this.minArrivalTime);
      }
    }
    else {
      this.minArrivalTime = ARRIVAL_TIME_MIN_DEFAULT;
    }
  }

  /**
   * Event listener when there is a change in Order Details
   */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._colocationStaffEscortService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing,
      orderDetails.deliveryType,
      this._getScheduleDateTime()
    );
    this._colocationStaffEscortService.submitOrderRequest();
  }

  /**
   * Event listener when Order is Submitted
   */
  public onSubmitOrder(submitDetails: OrderDetails, serviceID: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: serviceID
    };
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {

    this.fcColocationService = new FormControl('', [CoreValidators.required]);
    this.fcEscortee = new FormControl('', [CoreValidators.required]);
    this.fcName = new FormControl('', [CoreValidators.required]);
    this.fcOrganization = new FormControl('', [CoreValidators.required]);
    this.fcJobTitle = new FormControl('', [CoreValidators.required]);
    this.fcMobile = new FormControl('', [CoreValidators.required,
                                        CoreValidators.pattern(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN)]);
    this.fcEmail = new FormControl('', [CoreValidators.required, CoreValidators.pattern(CommonDefinition.REGEX_EMAIL_PATTERN)]);
    this.fcAttendanceDate = new FormControl('', [CoreValidators.required]);
    this.fcArrivalTime = new FormControl('', [CoreValidators.required]);
    this.fcExitTime = new FormControl('', [CoreValidators.required]);
    this.fcRackIdentifier = new FormControl('', [CoreValidators.required]);
    this.fcWorkToPerform = new FormControl('', [CoreValidators.required]);
    this.fcToolsRequired = new FormControl('', []);
    this.fcReason = new FormControl('', [CoreValidators.required]);
    this.fcReferenceNumber = new FormControl('', []);

    this.fgColocationStaffEscortDetails = this._formBuilder.group({
      fcColocationService: this.fcColocationService,
      fcEscortee: this.fcEscortee,
      fcName: this.fcName,
      fcOrganization: this.fcOrganization,
      fcJobTitle: this.fcJobTitle,
      fcMobile: this.fcMobile,
      fcEmail: this.fcEmail,
      fcAttendanceDate: this.fcAttendanceDate,
      fcArrivalTime: this.fcArrivalTime,
      fcExitTime: this.fcExitTime,
      fcRackIdentifier: this.fcRackIdentifier,
      fcWorkToPerform: this.fcWorkToPerform,
      fcToolsRequired: this.fcToolsRequired,
      fcReason: this.fcReason,
      fcReferenceNumber: this.fcReferenceNumber
    });

    this.fgColocationStaffEscortDetails.valueChanges.pipe(
      takeUntil(this._formGroupSubject)
    ).subscribe();

    this._subscribeAttendanceDetailsChanges();

    this.fcColocationService.valueChanges.pipe(
      tap((value) => {
        if (!isNullOrEmpty(value)) {
          this.fcRackIdentifier.setValue(value.rackIdentifier);
        }
      })
    ).subscribe();
  }

  /**
   * Format the schedule based on the attendance date and arrival time
   */
  private _getScheduleDateTime(): string {
    if (isNullOrEmpty(this.fcAttendanceDate.value) || isNullOrEmpty(this.fcArrivalTime.value)) { return; }
    let attendanceDate = new Date(this.fcAttendanceDate.value);
    let convertedTime = this._dateTimeService.formatTimeStringToDate(this.fcArrivalTime.value);
    attendanceDate.setHours(convertedTime.getHours());
    attendanceDate.setMinutes(convertedTime.getMinutes());
    return attendanceDate.toISOString();
  }

  /**
   * Format the time similar to '00:00'
   */
  private _formatTime(time: string): string {
    if (isNullOrEmpty(time)) { return; }
    let dateTimeValue = this._dateTimeService.formatTimeStringToDate(time);
    return this._dateTimeService.formatDate(dateTimeValue, 'HH:mm');
  }

  /**
   * Subscribe to form changes
   */
  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onColocationStaffEscortFormChange())
    ).subscribe();
  }

  /**
   * Event listener whenever there is a change in the form
   */
  private _onColocationStaffEscortFormChange(): void {
    let isEscorteeSomeoneElse = this.isEscorteeSomeoneElse(this.fcEscortee.value) || this.isImpersonating;
    let attendeeFullName = (isEscorteeSomeoneElse) ? colocationEscorteeText[this.fcEscortee.value] :
      `${this._userAccount.firstName} ${this._userAccount.lastName}`;
    this._colocationStaffEscortService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcColocationService.value?.serviceId,
            itemOrderType: OrderIdType.ColocationStaffEscort,
            referenceId: COLOCATION_STAFF_ESCORT,
            deliveryType: DeliveryType.Standard,
            schedule: this.fcAttendanceDate.value,
            properties: createObject(McsOrderColocationStaffEscort, {
              attendeeName: formatStringToText(attendeeFullName),
              attendeeOrganization: (isEscorteeSomeoneElse) ? formatStringToText(this.fcOrganization.value) : formatStringToText(this._company.name),
              attendeeJobTitle: (isEscorteeSomeoneElse) ? formatStringToText(this.fcJobTitle.value) : formatStringToText(this._userAccount.jobTitle),
              attendeeMobileNumber: this._getMobileNumber(),
              attendeeEmailAddress: (isEscorteeSomeoneElse) ? this.fcEmail.value : this._userAccount.emailAddress,
              arrivalDate: new Date(this.fcAttendanceDate.value),
              arrivalTime: this._formatTime(this.fcArrivalTime.value),
              exitTime: this._formatTime(this.fcExitTime.value),
              rackIdentifier: formatStringToText(this.fcRackIdentifier.value),
              workRequired: formatStringToText(this.fcWorkToPerform.value),
              toolsRequired: formatStringToText(this.fcToolsRequired.value),
              remoteHandsExceptionReason: formatStringToText(this.fcReason.value),
              customerReferenceNumber: formatStringToText(this.fcReferenceNumber.value)
            })
          })
        ]
      })
    );
    this._changeDetector.detectChanges();
  }

  /**
   * Subscribe to Colocation Racks
   */
  private _getRackServices(): void {
    this.loadingInProgress = true;
    forkJoin(
        [this._apiService.getColocationRacks(),
        this._apiService.getColocationAntennas(),
        this._apiService.getColocationCustomDevices(),
        this._apiService.getColocationRooms(),
        this._apiService.getColocationStandardSqms()]
    )
    .pipe(
      catchError((error) => {
        this.loadingInProgress = false;
        this._errorStatus = error?.details?.status;
        return throwError(error);
      })
    )
    .subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      response.forEach((colocationResponseCollection) => {
        let colocationArray : Array<IRackService> = getSafeProperty(colocationResponseCollection, (obj) => obj.collection);
        if (isNullOrEmpty(colocationArray)) { return; }
        let colocationGroupName =  pluck(colocationArray, 'colocationGroup').find(_colocation => (!isNullOrUndefined(_colocation)));
        let optionsArray = new Array<McsOption>();
        this._addServicesToOptions(colocationArray, optionsArray);
        this.colocationGroups.push(createObject(McsOptionGroup, { groupName: colocationGroupName, options: optionsArray}));
      });
      this.hasServiceToDisplay = (this.colocationGroups.length > 0);
      this.loadingInProgress = false;
      this._changeDetector.detectChanges();
    });
  }

  /**
   * Subscribe to Colocation Antennas
   */
  private _addServicesToOptions(array: Array<IRackService>, targetOptionsArray: Array<McsOption>): void {
    if (isNullOrEmpty(array)) { return; }
    array.forEach((colocationObj) => {
      targetOptionsArray.push(createObject(McsOption, { text: colocationObj.serviceId, value: colocationObj }));
    });
  }

  /**
   * Initialize all the options for escortee
   */
  private _getEscorteeOptions(): void {
    this.escorteeOptions$ = of([
      createObject(McsOption, { text: colocationEscorteeText[ColocationEscortee.MySelf], value: ColocationEscortee.MySelf }),
      createObject(McsOption, { text: colocationEscorteeText[ColocationEscortee.SomeoneElse], value: ColocationEscortee.SomeoneElse })
    ]);
  }

  private _getUserIdentityAndAccountDetails(): void {
    this._company = this._switchAccountService.activeAccount;
    this._apiService.getAccount()
    .pipe(catchError((error) => {
      return throwError('No account information found.');
    }))
    .subscribe(
      (response) => {
        this._userAccount.firstName = response.firstName;
        this._userAccount.lastName = response.lastName;
        this._userAccount.phoneNumber = response.phoneNumber;
        this._userAccount.emailAddress = response.emailAddress;
        this._userAccount.jobTitle =  isNullOrEmpty(response.jobTitle) ? CommonDefinition.OTHER_TEXT : response.jobTitle;
        return this._userAccount;
      });
  }

  private _resetAttendeeFields(): void {
    this.fcName.setValue('');
    this.fcOrganization.setValue('');
    this.fcJobTitle.setValue('');
    this.fcMobile.setValue('');
    this.fcEmail.setValue('');
  }

  private _getMobileNumber(): string {
    return this.isEscorteeSomeoneElse(this.fcEscortee.value) || this.isImpersonating ?
      this.fcMobile.value : this._userAccount.phoneNumber;
  }
}
