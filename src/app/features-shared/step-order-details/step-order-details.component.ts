import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  forwardRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subject,
  of,
  BehaviorSubject
} from 'rxjs';
import {
  takeUntil,
  map,
  tap,
  shareReplay
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsDataChange,
  McsAuthenticationIdentity,
  McsAccessControlService,
  McsMatTableContext,
  McsTableDataSource2,
  McsDateTimeService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely,
  isNullOrUndefined,
  createObject,
  getCurrentDate,
  addHoursToDate,
  addMonthsToDate,
  addDaysToDate
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderItem,
  McsBilling,
  McsBillingSite,
  McsOption,
  DataStatus,
  ItemType,
  McsOrderItemType,
  McsEventTrack,
  McsOrderCharge,
  DeliveryType,
  WorkflowStatus,
  McsPermission,
  McsFilterInfo,
  Day
} from '@app/models';
import {
  WizardStepComponent,
  McsFormGroupDirective,
  ColumnFilter
} from '@app/shared';
import { McsApiService } from '@app/services';
import { OrderDetails } from './order-details';

interface ChargesState {
  monthly: boolean;
  oneOff: boolean;
  excessUsagePerGb: boolean;
  hourly: boolean;
}

const CURRENT_DATE = getCurrentDate();
const MAX_DATE = addMonthsToDate(CURRENT_DATE, 6);
const MIN_TIME = '8:00 AM';
const MAX_TIME = '6:00 PM';
const STEP_HOUR: number = 1;
const STEP_MINUTE: number = 30;
const BUSINESS_HOUR_END_TIME = 18;
const BUSINESS_HOUR_START_TIME = 8;

@Component({
  selector: 'mcs-step-order-details',
  templateUrl: 'step-order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StepOrderDetailsComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy, IMcsDataChange<OrderDetails> {

  @Output()
  public submitOrder = new EventEmitter<OrderDetails>();

  @Output()
  public dataChange = new EventEmitter<OrderDetails>();

  @Input()
  public order: McsOrder;

  @Input()
  public orderItemType: McsOrderItemType;

  @Input()
  public requestState: DataStatus;

  @Input()
  public eventTrack: McsEventTrack;

  // Form variables
  public fgOrderBilling: FormGroup;
  public fcContractTerm: FormControl;
  public fcBillingEntity: FormControl;
  public fcBillingSite: FormControl;
  public fcBillingCostCenter: FormControl;
  public fcDescription: FormControl;
  public fcDeliveryType: FormControl;
  public fcWorkflowAction: FormControl;
  public fcDateSchedule: FormControl;
  public fcTimeSchedule: FormControl;

  // Others
  public contractTerms$: Observable<McsOption[]>;
  public billing$: Observable<McsBilling[]>;
  public selectedBilling$: Observable<McsBilling>;
  public selectedBillingSite$: Observable<McsBillingSite>;
  public chargesState$: Observable<ChargesState>;
  public minimumScheduleDate$: Observable<Date>;

  public workflowAction: OrderWorkflowAction;
  public dataSource: McsTableDataSource2<McsOrderItem>;
  public orderDataColumns: string[] = [];
  public dataChangeStatus: DataStatus;
  public orderItems: McsOrderItem[] = [];

  private _minTime: string = MIN_TIME;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _chargesStateChange = new BehaviorSubject<ChargesState>(
    { excessUsagePerGb: false, monthly: false, oneOff: false, hourly: false }
  );

  constructor(
    @Inject(forwardRef(() => WizardStepComponent)) private _wizardStep: WizardStepComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dateTimeService: McsDateTimeService,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService,
    private _translateService: TranslateService
  ) {
    this._registerFormGroup();
  }

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  public ngOnInit() {
    this._subscribeToContractTerms();
    this._subscribeToBillingDetails();
    this._subscribeToChargesStateChange();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let orderItemTypeChange = changes['orderItemType'];
    if (!isNullOrEmpty(orderItemTypeChange)) {
      this._updateFormGroupByType();
      this._setOrderDescription();
      this._updateMinimumScheduleDate();
    }

    let requestChange = changes['requestState'];
    if (!isNullOrEmpty(requestChange)) {
      this._setChangeStatusByRequestState();
      this._setInputDescriptionState();
    }

    let orderChange = changes['order'];
    if (!isNullOrEmpty(orderChange)) {
      this._initializeOrderDatasource();
      this._setChargesState();
    }
  }

  public ngAfterViewInit() {
    this._subscribeToDataChange();
    this._subscribeToWizardStepActivated();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get orderWorkFlowEnum(): any {
    return OrderWorkflowAction;
  }

  public get deliveryTypeEnum(): any {
    return DeliveryType;
  }

  public get orderTypeEnum(): any {
    return ItemType;
  }

  public get hasLeadTimeOptions(): boolean {
    return getSafeProperty(this.orderItemType, (obj) => obj.hasLeadTimeOptions, false);
  }

  public get standardLeadTimeHours(): number {
    return getSafeProperty(this.orderItemType, (obj) => obj.standardLeadTimeHours, 0);
  }

  public get acceleratedLeadTimeHours(): number {
    return getSafeProperty(this.orderItemType, (obj) => obj.acceleratedLeadTimeHours, 0);
  }

  public get stepHour(): number {
    return STEP_HOUR;
  }

  public get stepMinute(): number {
    return STEP_MINUTE;
  }

  public get businessHourEndTime(): number {
    return BUSINESS_HOUR_END_TIME;
  }

  public get businessHourStartTime(): number {
    return BUSINESS_HOUR_START_TIME;
  }

  public get minDate(): Date {
    let date = this._setDateToBusinessDays(new Date());
    let minDateHour = date.getHours() + (date.getMinutes()/60);
    let isTimeOutsideBusinessHours = minDateHour < 8 || minDateHour >= 18;
    if (isTimeOutsideBusinessHours) {
      date = this._setTimeToBusinessHours(date, minDateHour);
    }
    let minDateTime  = this.addStandarLeadTimeHoursToMinDate(date, this.standardLeadTimeHours);
    minDateTime = this._adjustDateMinutesByStepMinute(minDateTime);
    if (minDateTime.getDay() === Day.Saturday) {
      minDateTime = addHoursToDate(minDateTime, 48);
    } else if (minDateTime.getDay() === Day.Sunday) {
      minDateTime = addHoursToDate(minDateTime, 24);
    }
    return minDateTime;
  }

  public get maxDate(): Date {
    return MAX_DATE;
  }

  public get minTime(): string {
    return this._minTime;
  }

  public get maxTime(): string {
    return MAX_TIME;
  }

  /**
   * Returns true when the order has been successfully created and no changes have been made
   */
  public get isNextButtonDisabled(): boolean {
    return isNullOrEmpty(this.order) ||
      !this.allFormFieldsAreValid ||
      this.dataChangeStatus === DataStatus.PreActive ||
      this.dataChangeStatus === DataStatus.Active ||
      this.dataChangeStatus === DataStatus.Error;
  }

  /**
   * Returns true when the condition has an order
   */
  public get hasOrder(): boolean {
    return !isNullOrEmpty(getSafeProperty(this.order, (obj) => obj.items));
  }

  /**
   * Returns true when all forms are valid
   */
  public get allFormFieldsAreValid(): boolean {
    if (isNullOrEmpty(this._formGroup)) { return false; }
    return this._formGroup.isValid();
  }

  /**
   * Returns true when the charges has been updating
   */
  public get isUpdatingCharges(): boolean {
    return this.dataChangeStatus === DataStatus.Active;
  }

  /**
   * Checks if schedule control should be shown
   */
  public get showSchedule(): boolean {
    let isStandardDelivery = (this.fcDeliveryType.value === DeliveryType.Standard);
    let isWorkFlowSubmitOrAwaiting = (this.fcWorkflowAction.value === WorkflowStatus.AwaitingApproval
      || this.fcWorkflowAction.value === WorkflowStatus.Submitted);
    let isSchedulable = getSafeProperty(this.orderItemType, (obj) => obj.isSchedulable, false);
    let result = (isStandardDelivery && isWorkFlowSubmitOrAwaiting && isSchedulable);

    return result;
  }

  public filteredDates = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== Day.Saturday && day !== Day.Sunday;
  }

  public onDateChanged(selectedDate: string): void {
    let selectedDateIsEqualToMinDate = selectedDate === this.minDate.toDateString();
    if (selectedDateIsEqualToMinDate) {
      this._minTime = this._dateTimeService.formatDate(this.minDate, 'shortTime');
      this.fcTimeSchedule.setValue(this._minTime);
    } else {
      this._minTime = MIN_TIME;
    }
  }

  public addStandarLeadTimeHoursToMinDate(date: Date, standardLeadTimeHours: number): Date {
    let minDate = date;
    let numOfDaysToAdd = Math.floor(standardLeadTimeHours/10);
    let numOfHoursToAdd =  +(((standardLeadTimeHours/10) % 1)*10).toFixed();
    if (numOfHoursToAdd > 0) {
      minDate = new Date(addHoursToDate(minDate, numOfHoursToAdd));
    }
    let timeHour = minDate.getHours() + (minDate.getMinutes()/60);
    let isDateOutsideBusinessHours = (timeHour >= this.businessHourEndTime) || (date.getDate() < minDate.getDate());
    if (isDateOutsideBusinessHours) {
      let businessEndTimeAndCurrentHourDifference =  this.businessHourEndTime - date.getHours();
      let additionalHour = numOfHoursToAdd - businessEndTimeAndCurrentHourDifference;
      let remainingStandardLeadTimeHourToAdd =  (additionalHour) + (date.getMinutes()/60);
      let newDate = addDaysToDate(date, 1);
      minDate = new Date(newDate.setHours(this.businessHourStartTime + remainingStandardLeadTimeHourToAdd));
    }
    let count = 0;
    while(count < numOfDaysToAdd){
      minDate = new Date(minDate.setDate(minDate.getDate() + 1));
      let isDateOnWeekend = minDate.getDay() !== Day.Saturday && minDate.getDay() !== Day.Sunday;
      if(isDateOnWeekend) {
        count++;
      }
    }
    return new Date(minDate);
  }

  /**
   * Event that emits when the description was focused
   * @param input Input element that on focused
   */
  public onDescriptionFocus(input: HTMLInputElement): void {
    let isControlDisabled = getSafeProperty(this.fcDescription, (obj) => obj.disabled);
    if (isControlDisabled) { return; }

    let textLength = getSafeProperty(input, (obj) => obj.value.length);
    input.setSelectionRange(0, textLength);
  }

  /**
   * Event that emits when the order has been changed
   */
  public onDataChange(): void {
    if (!this.allFormFieldsAreValid) { return; }
    this.notifyDataChange();
  }

  /**
   * Event that emits when the order has been submitted
   */
  public onClickSubmitOrder(): void {
    if (!this.allFormFieldsAreValid) {
      this._formGroup.validateFormControls(true);
      return;
    }
    this.submitOrder.next(this._getOrderDetails());
  }

  /**
   * Notifies the data change event
   */
  public notifyDataChange(): void {
    this.dataChange.next(this._getOrderDetails());
    this._changeDetectorRef.markForCheck();
  }

  public assignContextualHelpTextToOrderAction(isImpersonating): string {
    let hasOrderApproveAccess = this._accessControlService.hasPermission([McsPermission.OrderApprove]);

    if (isImpersonating) {
      return this._translateService.instant('orderDetailsStep.orderActions.contextualHelp.isImpersonating');
    } else if (hasOrderApproveAccess) {
      return this._translateService.instant('orderDetailsStep.orderActions.contextualHelp.orderApprover');
    } else {
      return this._translateService.instant('orderDetailsStep.orderActions.contextualHelp.orderEdit');
    }
  }

  /**
   * Returns the constructed order details
   */
  private _getOrderDetails(): OrderDetails {
    if (isNullOrEmpty(this.fgOrderBilling)) { return; }

    let orderDetails = new OrderDetails();
    orderDetails.description = this.fcDescription.value;
    orderDetails.workflowAction = this.fcWorkflowAction.value;
    let dateValue = getSafeProperty(this.fcDateSchedule, (obj) => obj.value, this.minDate.toDateString());
    let timeValue = getSafeProperty(this.fcTimeSchedule, (obj) => obj.value, this.minDate.toLocaleTimeString());
    if (this.hasLeadTimeOptions) {
      let standardLeadTimeHour = (this.showSchedule === true) ?
                                  this._mergeDateAndTime(dateValue, timeValue) :
                                  this.minDate.toISOString();

      orderDetails.deliveryType = +getSafeProperty(this.fcDeliveryType, (obj) => obj.value, 0);
      orderDetails.schedule = (orderDetails.deliveryType === DeliveryType.Accelerated) ?
                              addHoursToDate(new Date(), this.acceleratedLeadTimeHours).toISOString()
                            : standardLeadTimeHour;
    }
    orderDetails.contractDurationMonths = +getSafeProperty(this.fcContractTerm, (obj) => obj.value, 0);
    orderDetails.billingEntityId = +getSafeProperty(this.fcBillingEntity, (obj) => obj.value.id, 0);
    orderDetails.billingSiteId = +getSafeProperty(this.fcBillingSite, (obj) => obj.value.id, 0);
    orderDetails.billingCostCentreId = +getSafeProperty(this.fcBillingCostCenter, (obj) => obj.value.id, 0);
    return orderDetails;
  }

  private _mergeDateAndTime(date: string, time: string): string {
    return new Date(`${date} ${time}`).toISOString();
  }

  /**
   * Updates the form group by order type
   */
  private _updateFormGroupByType(): void {
    let itemType = getSafeProperty(this.orderItemType, (obj) => obj.itemType, ItemType.Change);
    itemType === ItemType.Change ? this._setOrderChangeFormControls() : this._setOrderNewFormControls();
  }

  /**
   * Sets the order description based on the order details
   */
  private _setOrderDescription(): void {
    let descriptionCanBeSet = !isNullOrEmpty(this.fcDescription);
    if (!descriptionCanBeSet) { return; }

    let desciption = getSafeProperty(this.orderItemType, (obj) => obj.description);
    if (isNullOrEmpty(this.fcDescription.value)) {
      this.fcDescription.setValue(desciption);
    }
  }

  /**
   * Sets the order type change form controls
   */
  private _setOrderChangeFormControls(): void {
    this.fgOrderBilling.setControl('fcDescription', this.fcDescription);
    this.fgOrderBilling.setControl('fcDeliveryType', this.fcDeliveryType);
    this.fgOrderBilling.setControl('fcDateSchedule', this.fcDateSchedule);
    this.fgOrderBilling.setControl('fcTimeSchedule', this.fcTimeSchedule);
    this.fgOrderBilling.removeControl('fcContractTerm');
    this.fgOrderBilling.removeControl('fcBillingEntity');
    this.fgOrderBilling.removeControl('fcBillingSite');
    this.fgOrderBilling.removeControl('fcBillingCostCenter');
  }

  /**
   * Sets the order type new form controls
   */
  private _setOrderNewFormControls(): void {
    this.fgOrderBilling.setControl('fcDescription', this.fcDescription);
    this.fgOrderBilling.setControl('fcDeliveryType', this.fcDeliveryType);
    this.fgOrderBilling.setControl('fcDateSchedule', this.fcDateSchedule);
    this.fgOrderBilling.setControl('fcTimeSchedule', this.fcTimeSchedule);
    this.fgOrderBilling.setControl('fcContractTerm', this.fcContractTerm);
    this.fgOrderBilling.setControl('fcBillingEntity', this.fcBillingEntity);
    this.fgOrderBilling.setControl('fcBillingSite', this.fcBillingSite);
    this.fgOrderBilling.setControl('fcBillingCostCenter', this.fcBillingCostCenter);
  }

  /**
   * Sets the data change status
   */
  private _setChangeStatusByRequestState(): void {
    this.dataChangeStatus = this.requestState;
  }

  /**
   * Sets the excess usage fee flag based on order records
   */
  private _setChargesState(): void {
    let chargesState: ChargesState = { oneOff: false, monthly: false, excessUsagePerGb: false, hourly: false };
    let orderItems = getSafeProperty(this.order, (obj) => obj.items, []);

    orderItems.forEach((orderItem) => {
      if (chargesState.excessUsagePerGb && chargesState.monthly && chargesState.oneOff) { return; }
      let excessUsageFee = getSafeProperty(orderItem, (obj) => obj.charges.excessUsageFeePerGB);
      chargesState.excessUsagePerGb = chargesState.excessUsagePerGb ? chargesState.excessUsagePerGb : !isNullOrUndefined(excessUsageFee);
      let monthly = getSafeProperty(orderItem, (obj) => obj.charges.monthly);
      chargesState.monthly = chargesState.monthly ? chargesState.monthly : !isNullOrUndefined(monthly);
      let oneOff = getSafeProperty(orderItem, (obj) => obj.charges.oneOff);
      chargesState.oneOff = chargesState.oneOff ? chargesState.oneOff : !isNullOrUndefined(oneOff);
      let hourly = getSafeProperty(orderItem, (obj) => obj.charges.hourly);
      chargesState.hourly = chargesState.hourly ? chargesState.hourly : !isNullOrUndefined(hourly);
    });

    this._chargesStateChange.next(chargesState);
  }

  /**
   * Sets the input description state
   */
  private _setInputDescriptionState(): void {
    this.requestState === DataStatus.Active ?
      this.fcDescription.disable({ onlySelf: true }) :
      this.fcDescription.enable({ onlySelf: true });
  }

  /**
   * Initializes the order data source
   */
  private _initializeOrderDatasource(): void {
    this.dataSource = new McsTableDataSource2(this._setOrderItemsDataTypeToMatTableContext.bind(this));
    this._setOrderDetailsTableColumns();

    if (isNullOrEmpty(this.order)) { return; }

    let orderItems = Object.assign([], this.order.items);
    orderItems.push({
      description: this._translate.instant('orderDetailsStep.orderDetails.totalLabel'),
      charges: createObject(McsOrderCharge, new Object({
        monthly: getSafeProperty(this.order, (obj) => obj.charges.monthly),
        hourly: getSafeProperty(this.order, (obj) => obj.charges.hourly),
        oneOff: getSafeProperty(this.order, (obj) => obj.charges.oneOff),
        excessUsageFeePerGB: getSafeProperty(this.order, (obj) => obj.charges.excessUsageFeePerGB),
      }))
    });

    this.orderItems = orderItems;
    this.dataSource.updateDatasource(this._setOrderItemsDataTypeToMatTableContext.bind(this));
  }

  private _setOrderDetailsTableColumns(): void {
    let tableColumns = [
      createObject(McsFilterInfo, {
        value: true,
        exclude: true,
        id: 'description'
      }),
      createObject(McsFilterInfo, {
        value: (typeof this.order?.charges?.monthly === 'number') ? true : false,
        exclude: true,
        id: 'monthlyFee'
      }),
      createObject(McsFilterInfo, {
        value: (typeof this.order?.charges?.hourly === 'number') ? true : false,
        exclude: true,
        id: 'hourlyCharge'
      }),
      createObject(McsFilterInfo, {
        value: (typeof this.order?.charges?.oneOff === 'number') ? true : false,
        exclude: true,
        id: 'oneOffCharge'
      }),
      createObject(McsFilterInfo, {
        value: (typeof this.order?.charges?.excessUsageFeePerGB === 'number') ? true : false,
        exclude: true,
        id: 'excessUsageFeePerGB'
      }),
    ]
    let columnInfo: ColumnFilter = {
      filters: tableColumns,
      filterPredicate: undefined,
      filtersChange: new BehaviorSubject(tableColumns)
    }
    this.dataSource.registerColumnFilter(columnInfo);
  }

  private _setOrderItemsDataTypeToMatTableContext(): Observable<McsMatTableContext<McsOrderItem>> {
    return of(new McsMatTableContext(this.orderItems, this.orderItems?.length));
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    this.fcContractTerm = new FormControl('', [CoreValidators.required]);
    this.fcBillingEntity = new FormControl('', [CoreValidators.required]);
    this.fcBillingSite = new FormControl('', [CoreValidators.required]);
    this.fcBillingCostCenter = new FormControl('', [CoreValidators.required]);
    this.fcDescription = new FormControl('', [CoreValidators.required]);
    this.fcDeliveryType = new FormControl(DeliveryType.Standard, [CoreValidators.required]);
    this.fcWorkflowAction = new FormControl(OrderWorkflowAction.Submitted, [CoreValidators.required]);
    this.fcDateSchedule = new FormControl(this.minDate.toDateString(), [CoreValidators.required]);
    this.fcTimeSchedule = new FormControl(this.minDate.toLocaleTimeString(), [CoreValidators.required]);

    this.fgOrderBilling = this._formBuilder.group([]);
  }

  /**
   * Subscribes to contract terms
   */
  private _subscribeToContractTerms(): void {
    this.contractTerms$ = of([
      {
        value: 0,
        text: this._translate.instant('orderDetailsStep.orderActions.contractTerms.trial')
      },
      {
        value: 12,
        text: this._translate.instant('orderDetailsStep.orderActions.contractTerms.12Months')
      },
      {
        value: 24,
        text: this._translate.instant('orderDetailsStep.orderActions.contractTerms.24Months')
      },
      {
        value: 36,
        text: this._translate.instant('orderDetailsStep.orderActions.contractTerms.36Months')
      }
    ]);
  }

  /**
   * Returns the charges flags as observable
   */
  private _subscribeToChargesStateChange(): void {
    this.chargesState$ = this._chargesStateChange.asObservable().pipe(
      shareReplay(1)
    );
  }

  /**
   * Subscribes to order billing details
   */
  private _subscribeToBillingDetails(): void {
    this.billing$ = this._apiService.getBilling().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection))
    );
  }

  /**
   * Subscribes to form data change of the confirm details
   */
  private _subscribeToDataChange(): void {
    this._formGroup.valueChanges().pipe(
      takeUntil(this._destroySubject),
      tap(() => this.onDataChange())
    ).subscribe();
  }

  /**
   * Subscribes to wizard step when activated
   */
  private _subscribeToWizardStepActivated(): void {
    this._wizardStep.activated().pipe(
      takeUntil(this._destroySubject),
      tap(() => this.onDataChange())
    ).subscribe();
  }

  /**
   * Subscribes to order item type
   */
  private _updateMinimumScheduleDate(): void {
    this.minimumScheduleDate$ = of(
      this.minDate
    ).pipe(
      tap((date) => {
        this.fcDateSchedule.setValue(date.toDateString());
        this._minTime = this._dateTimeService.formatDate(date, 'shortTime')
        this.fcTimeSchedule.setValue(this._minTime);
      })
    );
  }

  private _setTimeToBusinessHours(date: Date, minDateHour: number): Date {
    let isTimeBeforeBusinessHours = minDateHour < 8;
    let isTimeAfterBusinessHours = minDateHour >= 18;
    if (isTimeBeforeBusinessHours) {
      return new Date(date.setHours(8,0,0));
    } else if (isTimeAfterBusinessHours) {
      return this._adjustDateTimeWithinBusinessHours(date, 1, 8);
    } else {
      return date;
    }
  }

  private _setDateToBusinessDays(currentDate: Date): Date {
    let currentHour = currentDate.getHours() + (currentDate.getMinutes()/60);
    if (currentDate.getDay() === Day.Friday && currentHour >= 18) {
      return this._adjustDateTimeWithinBusinessHours(currentDate, 3, 8);
    } else if (currentDate.getDay() === Day.Saturday) {
      return this._adjustDateTimeWithinBusinessHours(currentDate, 2, 8);
    } else if (currentDate.getDay() === Day.Sunday) {
      return this._adjustDateTimeWithinBusinessHours(currentDate, 1, 8);
    } else {
      return currentDate;
    }
  }

  private _adjustDateTimeWithinBusinessHours(date: Date, daysToAdd: number, hour: number): Date {
    let adjustedDate = new Date(new Date().setDate(date.getDate() + daysToAdd));
    return new Date(adjustedDate.setHours(hour, 0, 0));
  }

  private _adjustDateMinutesByStepMinute(date: Date): Date {
    if (date.getMinutes() === 0) { return date; }
    let minutes = new Date().getMinutes() > this.stepMinute ? 0 : this.stepMinute;
    date.setMinutes(minutes);
    if (minutes <= 0) {
      date = addHoursToDate(date, 1);
    }
    return date;
  }

}
