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
  empty
} from 'rxjs';
import {
  takeUntil,
  catchError,
  map,
  tap
} from 'rxjs/operators';
import {
  McsTableDataSource,
  CoreValidators,
  IMcsDataChange
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely,
  isNullOrUndefined
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderItem,
  McsBilling,
  McsBillingSite,
  McsOption,
  DataStatus,
  OrderType
} from '@app/models';
import {
  WizardStepComponent,
  McsFormGroupDirective
} from '@app/shared';
import { McsApiService } from '@app/services';
import { OrderDetails } from './order-details';

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
  public orderType: OrderType;

  @Input()
  public requestState: DataStatus;

  // Form variables
  public fgOrderBilling: FormGroup;
  public fcContractTerm: FormControl;
  public fcBillingEntity: FormControl;
  public fcBillingSite: FormControl;
  public fcBillingCostCenter: FormControl;
  public fcDescription: FormControl;
  public fcWorkflowAction: FormControl;

  // Others
  public contractTerms$: Observable<McsOption[]>;
  public billing$: Observable<McsBilling[]>;
  public selectedBilling$: Observable<McsBilling>;
  public selectedBillingSite$: Observable<McsBillingSite>;
  public isChangeOrder$: Observable<boolean>;

  public workflowAction: OrderWorkflowAction;
  public orderDatasource: McsTableDataSource<McsOrderItem>;
  public orderDataColumns: string[] = [];
  public dataChangeStatus: DataStatus;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    @Inject(forwardRef(() => WizardStepComponent)) private _wizardStep: WizardStepComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _apiService: McsApiService
  ) {
    this.orderDatasource = new McsTableDataSource([]);
    this.orderType = OrderType.New;
    this._registerFormGroup();
    this._setDataColumns();
  }

  public ngOnInit() {
    this._subscribeToContractTerms();
    this._subscribeToBillingDetails();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let orderTypeChange = changes['orderType'];
    if (!isNullOrEmpty(orderTypeChange)) {
      this._updateFormGroupBytype();
    }

    let requestChange = changes['requestState'];
    if (!isNullOrEmpty(requestChange)) {
      this._setChangeStatusByRequestState();
      this._setTableStatus();
    }

    let orderChange = changes['order'];
    if (!isNullOrEmpty(orderChange)) {
      this._initializeOrderDatasource();
      this._setOrderDescription();
    }
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToDataChange();
      this._subscribeToWizardStepActivated();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get orderWorkFlowEnum(): any {
    return OrderWorkflowAction;
  }

  public get orderTypeEnum(): any {
    return OrderType;
  }

  /**
   * Returns true when the order has been successfully created and no changes have been made
   */
  public get isNextButtonDisabled(): boolean {
    return this.isUpdatingCharges || !this.allFormFieldsAreValid;
  }

  /**
   * Returns true when the order is currently on-going
   */
  public get orderIsInProgress(): boolean {
    return this.requestState === DataStatus.InProgress;
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
    return (isNullOrEmpty(this.order) && isNullOrUndefined(this.dataChangeStatus)) ||
      this.dataChangeStatus === DataStatus.InProgress;
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
    this.dataChangeStatus = DataStatus.InProgress;
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
  }

  /**
   * Returns the constructed order details
   */
  private _getOrderDetails(): OrderDetails {
    if (isNullOrEmpty(this.fgOrderBilling)) { return; }

    let orderDetails = new OrderDetails();
    orderDetails.description = this.fcDescription.value;
    orderDetails.workflowAction = this.fcWorkflowAction.value;
    orderDetails.contractDurationMonths = +getSafeProperty(this.fcContractTerm, (obj) => obj.value, 0);
    orderDetails.billingEntityId = +getSafeProperty(this.fcBillingEntity, (obj) => obj.value.id, 0);
    orderDetails.billingSiteId = +getSafeProperty(this.fcBillingSite, (obj) => obj.value.id, 0);
    orderDetails.billingCostCentreId = +getSafeProperty(this.fcBillingCostCenter, (obj) => obj.value.id, 0);
    return orderDetails;
  }

  /**
   * Sets the order description based on the order details
   */
  private _setOrderDescription(): void {
    let descriptionCanBeSet = this.hasOrder && !isNullOrEmpty(this.fcDescription);
    if (!descriptionCanBeSet) { return; }

    if (this.fcDescription.value !== this.order.description) {
      this.fcDescription.setValue(this.order.description);
    }
  }

  /**
   * Updates the form group by order type
   */
  private _updateFormGroupBytype(): void {
    this.orderType === OrderType.Change ?
      this._setOrderChangeFormControls() :
      this._setOrderNewFormControls();
  }

  /**
   * Sets the order type change form controls
   */
  private _setOrderChangeFormControls(): void {
    this.fgOrderBilling.setControl('fcDescription', this.fcDescription);
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
    this.fgOrderBilling.setControl('fcContractTerm', this.fcContractTerm);
    this.fgOrderBilling.setControl('fcBillingEntity', this.fcBillingEntity);
    this.fgOrderBilling.setControl('fcBillingSite', this.fcBillingSite);
    this.fgOrderBilling.setControl('fcBillingCostCenter', this.fcBillingCostCenter);
  }

  /**
   * Sets the table status based on state provided
   */
  private _setTableStatus(): void {
    if (isNullOrUndefined(this.orderDatasource)) { return; }
    this.orderDatasource.updateDataStatus(this.requestState);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the data change status
   */
  private _setChangeStatusByRequestState(): void {
    this.dataChangeStatus = this.requestState;
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
      charges: {
        monthly: getSafeProperty(this.order, (obj) => obj.charges.monthly, 0),
        oneOff: getSafeProperty(this.order, (obj) => obj.charges.oneOff, 0)
      }
    });
    this.orderDatasource.updateDatasource(orderItems);
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Contract term settings
    this.fcContractTerm = new FormControl('', [
      CoreValidators.required
    ]);

    // Billing entity settings
    this.fcBillingEntity = new FormControl('', [
      CoreValidators.required
    ]);

    // Billing site settings
    this.fcBillingSite = new FormControl('', [
      CoreValidators.required
    ]);

    // Billing cost centre settings
    this.fcBillingCostCenter = new FormControl('', [
      CoreValidators.required
    ]);

    // Description settings
    this.fcDescription = new FormControl('', [
      CoreValidators.required
    ]);

    // Workflow actions
    this.fcWorkflowAction = new FormControl(OrderWorkflowAction.Submitted, [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgOrderBilling = this._formBuilder.group([]);
  }

  /**
   * Subscribes to contract terms
   */
  private _subscribeToContractTerms(): void {
    // TODO: Need to consider the change order
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
   * Subscribes to order billing details
   */
  private _subscribeToBillingDetails(): void {
    this.billing$ = this._apiService.getBilling().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      catchError(() => empty())
    );
  }

  /**
   * Subscribes to form data change of the confirm details
   */
  private _subscribeToDataChange(): void {
    this._formGroup.valueChanges().pipe(
      takeUntil(this._destroySubject),
    ).subscribe(() => this.onDataChange());
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
}
