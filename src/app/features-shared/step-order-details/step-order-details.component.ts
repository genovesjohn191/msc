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
  ChangeDetectorRef
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
  of
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  DataStatus
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { McsOrdersRepository } from '@app/services';
import { OrderDetails } from './order-details';

@Component({
  selector: 'mcs-step-order-details',
  templateUrl: 'step-order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StepOrderDetailsComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy, IMcsDataChange<OrderDetails> {
  @Input()
  public order: McsOrder;

  @Input()
  public requestState: DataStatus;

  @Output()
  public submitOrder = new EventEmitter<OrderDetails>();

  @Output()
  public dataChange = new EventEmitter<OrderDetails>();

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

  public workflowAction: OrderWorkflowAction;
  public orderDatasource: McsTableDataSource<McsOrderItem>;
  public orderDataColumns: string[] = [];
  public dataChangeStatus: DataStatus;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _ordersRepository: McsOrdersRepository
  ) {
    this.orderDatasource = new McsTableDataSource([]);
    this._registerFormGroup();
    this._setDataColumns();
  }

  public ngOnInit() {
    this._subscribeToContractTerms();
    this._subscribeToBillingDetails();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let orderChange = changes['order'];
    if (!isNullOrEmpty(orderChange)) {
      this._initializeOrderDatasource();
      this._setOrderDescription();
    }

    let requestChange = changes['requestState'];
    if (!isNullOrEmpty(requestChange)) {
      this._setFormFieldsStatus();
      this._setDataChangeStatus();
      this._setTableStatus();
    }
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToDataChange();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get orderWorkFlowEnum(): any {
    return OrderWorkflowAction;
  }

  /**
   * Returns true when the order has been successfully created and no changes have been made
   */
  public get isNextButtonDisabled(): boolean {
    return this.requestState === DataStatus.InProgress ||
      this.requestState === DataStatus.Error ||
      this.dataChangeStatus === DataStatus.InProgress ||
      !this.allFormFieldsAreValid;
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
    orderDetails.contractDurationMonths = this.fcContractTerm.value;
    orderDetails.billingEntity = this.fcBillingEntity.value;
    orderDetails.billingSite = this.fcBillingSite.value;
    orderDetails.billingCostCentre = this.fcBillingCostCenter.value;
    orderDetails.workflowAction = this.fcWorkflowAction.value;
    return orderDetails;
  }

  /**
   * Sets the order description based on the order details
   */
  private _setOrderDescription(): void {
    let descriptionCanBeSet = this.hasOrder && !isNullOrEmpty(this.fcDescription);
    if (!descriptionCanBeSet) { return; }
    this.fcDescription.setValue(this.order.description);
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
  private _setDataChangeStatus(): void {
    this.dataChangeStatus = this.requestState;
  }

  /**
   * Sets the form fields status
   */
  private _setFormFieldsStatus(): void {
    if (isNullOrEmpty(this.fcDescription)) { return; }
    this.orderIsInProgress ?
      this.fcDescription.disable() :
      this.fcDescription.enable();
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
    this.orderDatasource.updateDatasource(orderItems);

    this.orderDatasource.addOrUpdateRecord({
      description: this._translate.instant('orderDetailsStep.orderDetails.totalLabel'),
      charges: {
        monthly: getSafeProperty(this.order, (obj) => obj.charges.monthly, 0),
        oneOff: getSafeProperty(this.order, (obj) => obj.charges.oneOff, 0)
      }
    } as McsOrderItem);
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
    this.fgOrderBilling = this._formBuilder.group({
      fcContractTerm: this.fcContractTerm,
      fcBillingEntity: this.fcBillingEntity,
      fcBillingSite: this.fcBillingSite,
      fcBillingCostCenter: this.fcBillingCostCenter,
      fcDescription: this.fcDescription
    });
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
    this.billing$ = this._ordersRepository.getBilling();
  }

  /**
   * Subscribes to form data change of the confirm details
   */
  private _subscribeToDataChange(): void {
    this._formGroup.valueChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this.onDataChange());
  }
}
