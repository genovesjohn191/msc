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
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { SwitchAccountService } from '@app/core-layout/shared';
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
  Guid
} from '@app/utilities';

import { ColocationStaffEscortService } from './colocation-staff-escort.service';

const COLOCATION_STAFF_ESCORT = Guid.newGuid().toString();
const TEXTAREA_MAXLENGTH_DEFAULT = 850;
const MAX_HOUR = 23;
const MAX_DATE = addMonthsToDate(getCurrentDate(), 12);
const STEP_HOUR: number = 1;
const STEP_MINUTE: number = 30;
const DEFAULT_ARRIVAL_EXIT_TIME_RANGE = 4;
const ARRIVAL_TIME_MAX: [number, number] = [23, 0];
const EXIT_TIME_MAX: [number, number] = [23, STEP_MINUTE];
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
  public fcWorkToPerform: FormControl;
  public fcToolsRequired: FormControl;
  public fcReason: FormControl;
  public fcReferenceNumber: FormControl;
  public staffEscortStandardLeadTimeHours: number;
  public colocationRacks$: Observable<McsServiceBase[]>;
  public colocationAntennas$: Observable<McsServiceBase[]>;
  public colocationCustomDevices$: Observable<McsServiceBase[]>;
  public colocationRooms$: Observable<McsServiceBase[]>;
  public colocationStandardSqMs$: Observable<McsServiceBase[]>;
  public escorteeOptions$: Observable<McsOption[]>;
  public colocationGroups: McsOptionGroup[] = [];
  public hasServiceToDisplay: boolean;
  public loadingInProgress: boolean;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
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
    this._getLeadTimeHours();
    this._getUserIdentityAndAccountDetails();
    this._getEscorteeOptions();
    this._getRackServices();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedRackServiceHandler);
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
    return getCurrentDate();
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

  // TO DO: for unit test
  public get defaultArrivalTime(): [number, number] {
    let arrivalHour =  this.minDate.getHours() + DEFAULT_ARRIVAL_EXIT_TIME_RANGE ;
    let arrivalMinutes = this.minDate.getMinutes();
    if (arrivalMinutes >= STEP_MINUTE) {
      arrivalHour = arrivalHour+1;
      arrivalMinutes = 0;
    }
    else{
      arrivalMinutes = STEP_MINUTE;
    }
    return  (arrivalHour > MAX_HOUR) ? [23, 0] :  [arrivalHour, arrivalMinutes];
  }

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  // TO DO: for unit test
  public get defaultExitTime(): [number, number] {
    let exitHours = this.defaultArrivalTime[0] + DEFAULT_ARRIVAL_EXIT_TIME_RANGE;
    let exitMinutes = this.defaultArrivalTime[1];
    return exitHours > MAX_HOUR ? [23, 30] : [exitHours, exitMinutes];
  }

  public get maxArrivalTime(): [number, number] {
    return ARRIVAL_TIME_MAX;
  }

  public get maxExitTime(): [number, number] {
    return EXIT_TIME_MAX;
  }
  // TO DO: for unit Tests
  public get minExitTime(): [number, number] {
    let minTime =  this.fcArrivalTime.value;
    if(isNullOrEmpty(minTime)){ return; }
    return [minTime[0], minTime[1] + STEP_MINUTE];
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

  public onArrivalTimeChange(_value: [number, number]): void {
    this.fcArrivalTime.setValue(_value);
    this.fcArrivalTime.updateValueAndValidity();
    this.fcExitTime.updateValueAndValidity();
  }
  public onExitTimeChange(_value: [number, number]): void {
    this.fcExitTime.setValue(_value);
    this.fcExitTime.updateValueAndValidity();
    this.fcArrivalTime.updateValueAndValidity();
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
      this._formatSchedule(this.fcAttendanceDate.value, this.fcArrivalTime.value)
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
    this.fcAttendanceDate = new FormControl(this.minDate, []);
    this.fcArrivalTime = new FormControl(this.defaultArrivalTime,[CoreValidators.required]);
    this.fcExitTime = new FormControl(this.defaultExitTime, [CoreValidators.required]);
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
      fcWorkToPerform: this.fcWorkToPerform,
      fcToolsRequired: this.fcToolsRequired,
      fcReason: this.fcReason,
      fcReferenceNumber: this.fcReferenceNumber
    });

    this.fgColocationStaffEscortDetails.valueChanges.pipe(
      takeUntil(this._formGroupSubject)
    ).subscribe();
  }

  /**
   * Format the schedule based on the attendance date and arrival time
   */
  private _formatSchedule(attendanceDate: Date, arrivalTime: [number, number]): string {
    if (isNullOrEmpty(attendanceDate) || isNullOrEmpty(arrivalTime)) { return; }
    attendanceDate.setHours(arrivalTime[0]);
    attendanceDate.setMinutes(arrivalTime[1]);
    return attendanceDate.toISOString();
  }

  /**
   * Format the time similar to '00:00'
   */
  private _formatTime(time: [number, number]): string {
    if (isNullOrEmpty(time)) { return; }
    let formatTwoDigit = (_time) => ('0' + _time).slice(-2);
    return `${formatTwoDigit(time[0])}:${formatTwoDigit(time[1])}`;
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
              attendeeName: (isEscorteeSomeoneElse) ? colocationEscorteeText[this.fcEscortee.value] :
                            `${this._userAccount.firstName} ${this._userAccount.lastName}`,
              attendeeOrganization: (isEscorteeSomeoneElse) ? this.fcOrganization.value : this._company.name,
              attendeeJobTitle: (isEscorteeSomeoneElse) ? this.fcJobTitle.value : this._userAccount.jobTitle,
              attendeeMobileNumber: this._formatMobileNumber(),
              attendeeEmailAddress: (isEscorteeSomeoneElse) ? this.fcEmail.value : this._userAccount.emailAddress,
              arrivalDate: this.fcAttendanceDate.value,
              arrivalTime: this._formatTime(this.fcArrivalTime.value),
              exitTime: this._formatTime(this.fcExitTime.value),
              workRequired: this.fcWorkToPerform.value,
              toolsRequired: this.fcToolsRequired.value,
              remoteHandsExceptionReason: this.fcReason.value,
              customerReferenceNumber: this.fcReferenceNumber.value
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

  private _getLeadTimeHours(): void {
    this.orderItemType$.subscribe(order => {
      this.staffEscortStandardLeadTimeHours = order.standardLeadTimeHours;
    });
  }

  private _formatMobileNumber(): string {
    let userPhoneNumber: string = this._userAccount.phoneNumber;
    if (this.isEscorteeSomeoneElse(this.fcEscortee.value) || this.isImpersonating) {
      let userInputNumber = formatStringToPhoneNumber(this.fcMobile.value,
                                                      CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN,
                                                      true);
      return userInputNumber;
    } else {
      return userPhoneNumber;
    }
  }
}
