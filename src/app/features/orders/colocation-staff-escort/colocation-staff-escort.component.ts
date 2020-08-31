import {
  OnDestroy,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  Injector
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  Observable,
  zip,
  of
} from 'rxjs';
import {
  takeUntil,
  tap,
  filter,
  map
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  OrderRequester,
  CoreValidators
} from '@app/core';
import {
  Guid,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  createObject,
  getCurrentDate,
  addMonthsToDate,
  addDaysToDate,
  addHoursToDate
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import {
  RouteKey,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemCreate,
  OrderIdType,
  McsOption,
  colocationEscorteeText,
  ColocationEscortee,
  McsServiceBase
} from '@app/models';
import { OrderDetails } from '@app/features-shared';
import { ColocationStaffEscortService } from './colocation-staff-escort.service';
import { McsOrderColocationStaffEscort } from '@app/models/request/mcs-order-colocation-staff-escort';

const COLOCATION_STAFF_ESCORT = Guid.newGuid().toString();
const TEXTAREA_MAXLENGTH_DEFAULT = 850;
const CURRENT_DATE = getCurrentDate();
const DATE_TOMORROW = addDaysToDate(CURRENT_DATE, 1);
const MIN_DATE = addHoursToDate(DATE_TOMORROW, 1);
const MAX_DATE = addMonthsToDate(CURRENT_DATE, 6);
const STEP_HOUR: number = 1;
const STEP_MINUTE: number = 30;
const DEFAULT_ARRIVAL_EXIT_TIME_RANGE = 4;
const ARRIVAL_TIME_CEIL: [number, number] = [23, 30];
const EXIT_TIME_FLOOR: [number, number] = [0, 30];

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

  public colocationRacks$: Observable<McsServiceBase[]>;
  public colocationAntennas$: Observable<McsServiceBase[]>;
  public colocationCustomDevices$: Observable<McsServiceBase[]>;
  public colocationRooms$: Observable<McsServiceBase[]>;
  public colocationStandardSqMs$: Observable<McsServiceBase[]>;
  public escorteeOptions$: Observable<McsOption[]>;


  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _colocationStaffEscortService: ColocationStaffEscortService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService
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
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._subscribeToEscorteeOptions();
    this._subscribeToColocationRacks();
    this._subscribeToColocationAntennas();
    this._subscribeToColocationCustomDevices();
    this._subscribeToColocationRooms();
    this._subscribeToColocationStandardSqms();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
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

  public get stepHour(): number {
    return STEP_HOUR;
  }

  public get stepMinute(): number {
    return STEP_MINUTE;
  }

  public get defaultArrivalTime(): [number, number] {
    return [MIN_DATE.getHours(), MIN_DATE.getMinutes()];
  }

  public get defaultExitTime(): [number, number] {
    let exitHours = MIN_DATE.getHours() + DEFAULT_ARRIVAL_EXIT_TIME_RANGE;
    let maxHour = 23;
    return exitHours > maxHour ? [23, 59] : [exitHours, MIN_DATE.getMinutes()];
  }

  public get minDate(): Date {
    return MIN_DATE;
  }

  public get maxDate(): Date {
    return MAX_DATE;
  }

  public get arrivalTimeCeil(): [number, number] {
    return ARRIVAL_TIME_CEIL;
  }

  public get exitTimeFloor(): [number, number] {
    return EXIT_TIME_FLOOR;
  }

  public isEscorteeSomeoneElse(escortee: ColocationEscortee): boolean {
    return escortee === ColocationEscortee.SomeoneElse;
  }

  public onEscorteeChange(escortee: ColocationEscortee): void {
    if (this.isEscorteeSomeoneElse(escortee)) {
      this.fcName.enable();
      this.fcOrganization.enable();
      this.fcJobTitle.enable();
      this.fcMobile.enable();
      this.fcEmail.enable();
      return;
    }

    this.fcName.disable();
    this.fcOrganization.disable();
    this.fcJobTitle.disable();
    this.fcMobile.disable();
    this.fcEmail.disable();
  }

  public onTimeChange(_value: [number, number]): void {
    this.fcExitTime.updateValueAndValidity();
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
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Format the schedule based on the attendance date and arrival time
   */
  private _formatSchedule(attendanceDate: Date, arrivalTime: [number, number]): Date {
    if (isNullOrEmpty(attendanceDate) || isNullOrEmpty(arrivalTime)) { return; }
    let formatDate = new Date(attendanceDate);
    formatDate.setHours(arrivalTime[0]);
    formatDate.setMinutes(arrivalTime[1]);
    return formatDate;
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
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fcColocationService = new FormControl('', [CoreValidators.required]);
    this.fcEscortee = new FormControl('', [CoreValidators.required]);
    this.fcName = new FormControl('', [CoreValidators.required]);
    this.fcOrganization = new FormControl('', [CoreValidators.required]);
    this.fcJobTitle = new FormControl('', [CoreValidators.required]);
    this.fcMobile = new FormControl('', [CoreValidators.required]);
    this.fcEmail = new FormControl('', [CoreValidators.required, CoreValidators.email]);
    this.fcAttendanceDate = new FormControl(this.minDate, []);
    this.fcArrivalTime = new FormControl(this.defaultArrivalTime, [CoreValidators.required]);
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
    this._colocationStaffEscortService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcColocationService.value,
            itemOrderType: OrderIdType.ColocationStaffEscort,
            referenceId: COLOCATION_STAFF_ESCORT,
            properties: createObject(McsOrderColocationStaffEscort, {
              anttendeeName: this.fcEscortee.value,
              attendeeOrganization: this.fcOrganization.value,
              attendeeJobTitle: this.fcJobTitle.value,
              attendeeMobileNumber: this.fcMobile.value,
              attendeeEmailAddress: this.fcEmail.value,
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
  }

  /**
   * Subscribe to Colocation Racks
   */
  private _subscribeToColocationRacks(): void {
    this.colocationRacks$ = this._apiService.getColocationRacks().pipe(
      map((response) => {
        let racks = getSafeProperty(response, (obj) => obj.collection);
        return racks.filter((rack) => getSafeProperty(rack, (obj) => obj.serviceId))
          .map((rack) => {
            rack.name = `${rack.description} (${rack.serviceId})`;
            return rack;
          });
      })
    );
  }

  /**
   * Subscribe to Colocation Antennas
   */
  private _subscribeToColocationAntennas(): void {
    this.colocationAntennas$ = this._apiService.getColocationAntennas().pipe(
      map((response) => {
        let antennas = getSafeProperty(response, (obj) => obj.collection);
        return antennas.filter((antenna) => getSafeProperty(antenna, (obj) => obj.serviceId))
          .map((antenna) => {
            antenna.name = `${antenna.description} (${antenna.serviceId})`;
            return antenna;
          });
      })
    );
  }

  /**
   * Subscribe to Colocation Custom Devices
   */
  private _subscribeToColocationCustomDevices(): void {
    this.colocationCustomDevices$ = this._apiService.getColocationCustomDevices().pipe(
      map((response) => {
        let devices = getSafeProperty(response, (obj) => obj.collection);
        return devices.filter((device) => getSafeProperty(device, (obj) => obj.serviceId))
          .map((device) => {
            device.name = `${device.description} (${device.serviceId})`;
            return device;
          });
      })
    );
  }

  /**
   * Subscribe to Colocation Rooms
   */
  private _subscribeToColocationRooms(): void {
    this.colocationRooms$ = this._apiService.getColocationRooms().pipe(
      map((response) => {
        let rooms = getSafeProperty(response, (obj) => obj.collection);
        return rooms.filter((room) => getSafeProperty(room, (obj) => obj.serviceId))
          .map((room) => {
            room.name = `${room.description} (${room.serviceId})`;
            return room;
          });
      })
    );
  }

  /**
   * Subscribe to Colocation Standard Square Metres
   */
  private _subscribeToColocationStandardSqms(): void {
    this.colocationStandardSqMs$ = this._apiService.getColocationStandardSqms().pipe(
      map((response) => {
        let sqms = getSafeProperty(response, (obj) => obj.collection);
        return sqms.filter((standardSqm) => getSafeProperty(standardSqm, (obj) => obj.serviceId))
          .map((sqm) => {
            sqm.name = `${sqm.description} (${sqm.serviceId})`;
            return sqm;
          });
      })
    );
  }

  /**
   * Initialize all the options for escortee
   */
  private _subscribeToEscorteeOptions(): void {
    this.escorteeOptions$ = of([
      createObject(McsOption, { text: colocationEscorteeText[ColocationEscortee.MySelf], value: ColocationEscortee.MySelf }),
      createObject(McsOption, { text: colocationEscorteeText[ColocationEscortee.SomeoneElse], value: ColocationEscortee.SomeoneElse })
    ]);
  }
}
