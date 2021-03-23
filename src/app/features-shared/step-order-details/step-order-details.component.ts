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
  McsTableDataSource,
  CoreValidators,
  IMcsDataChange,
  McsAuthenticationIdentity,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely,
  isNullOrUndefined,
  createObject,
  getCurrentDate,
  addDaysToDate,
  addHoursToDate,
  addMonthsToDate
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
  McsPermission
} from '@app/models';
import {
  WizardStepComponent,
  McsFormGroupDirective
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
const MIN_DATE = CURRENT_DATE;
const MAX_DATE = addMonthsToDate(CURRENT_DATE, 6);
const STEP_HOUR: number = 1;
const STEP_MINUTE: number = 30;

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
  public fcSchedule: FormControl;

  // Others
  public contractTerms$: Observable<McsOption[]>;
  public billing$: Observable<McsBilling[]>;
  public selectedBilling$: Observable<McsBilling>;
  public selectedBillingSite$: Observable<McsBillingSite>;
  public chargesState$: Observable<ChargesState>;
  public minimumScheduleDate$: Observable<Date>;

  public workflowAction: OrderWorkflowAction;
  public orderDatasource: McsTableDataSource<McsOrderItem>;
  public orderDataColumns: string[] = [];
  public dataChangeStatus: DataStatus;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _chargesStateChange = new BehaviorSubject<ChargesState>(
    { excessUsagePerGb: false, monthly: false, oneOff: false, hourly: false }
  );

  constructor(
    @Inject(forwardRef(() => WizardStepComponent)) private _wizardStep: WizardStepComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService,
    private _translateService: TranslateService
  ) {
    this.orderDatasource = new McsTableDataSource([]);
    this._registerFormGroup();
    this._setDataColumns();
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

  public get minDate(): Date {
    return addHoursToDate(new Date(),
    this.standardLeadTimeHours);
  }

  public get maxDate(): Date {
    return MAX_DATE;
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
    if (this.hasLeadTimeOptions) {
      let standardLeadTimeHour = (this.showSchedule === true) ?
                                  getSafeProperty(this.fcSchedule, (obj) => obj.value as Date, this.minDate).toISOString() :
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
    this.fgOrderBilling.setControl('fcSchedule', this.fcSchedule);
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
    this.fgOrderBilling.setControl('fcSchedule', this.fcSchedule);
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
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.orderDataColumns = Object.keys(
      this._translate.instant('orderDetailsStep.orderDetails.columnHeaders')
    );
    if (isNullOrEmpty(this.orderDataColumns)) {
      throw new Error('Column definition for order charges was not defined');
    }
  }

  /**
   * Initializes the order data source
   */
  private _initializeOrderDatasource(): void {
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
    this.orderDatasource.updateDatasource(orderItems);
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
    this.fcSchedule = new FormControl(this.minDate, [CoreValidators.required]);

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
      map((date) => {
        let minutes = new Date().getMinutes() > this.stepMinute ? 0 : this.stepMinute;
        date.setMinutes(minutes);
        if (minutes <= 0) {
          date = addHoursToDate(date, 1);
        }
        return date;
      }),
      tap((date) => {
        this.fcSchedule.setValue(date);
      })
    );
  }
}
