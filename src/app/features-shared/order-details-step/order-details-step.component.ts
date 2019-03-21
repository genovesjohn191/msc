import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  McsTableDataSource,
  CoreValidators,
  McsDateTimeService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderItem,
  McsBilling,
  McsBillingSite,
  McsOption
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { McsOrdersRepository } from '@app/services';
import { OrderDetails } from './order-details-step';

@Component({
  selector: 'mcs-order-details-step',
  templateUrl: 'order-details-step.component.html'
})

export class OrderDetailsStepComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public order: McsOrder;

  @Output()
  public submitOrder = new EventEmitter<OrderDetails>();

  // Form variables
  public fgOrderBilling: FormGroup;
  public fcContractTerm: FormControl;
  public fcBillingEntity: FormControl;
  public fcBillingSite: FormControl;
  public fcBillingCostCenter: FormControl;

  // Others
  public contractTerms$: Observable<McsOption[]>;
  public billing$: Observable<McsBilling[]>;
  public selectedBilling$: Observable<McsBilling>;
  public selectedBillingSite$: Observable<McsBillingSite>;

  public workflowAction: OrderWorkflowAction;
  public orderDescription: string;
  public orderDatasource: McsTableDataSource<McsOrderItem>;
  public orderDataColumns: string[] = [];

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    private _translate: TranslateService,
    private _dateTimeService: McsDateTimeService,
    private _ordersRepository: McsOrdersRepository
  ) {
    this.workflowAction = OrderWorkflowAction.Submitted;
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
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get orderWorkFlowEnum(): any {
    return OrderWorkflowAction;
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
   * Event that emits when the order has been submitted
   */
  public onClickSubmitOrder(): void {
    if (!this.allFormFieldsAreValid) {
      this._formGroup.validateFormControls(true);
      return;
    }

    this.submitOrder.next({
      description: this.orderDescription,
      contractDuration: this.fcContractTerm.value,
      billingEntity: this.fcBillingEntity.value,
      billingSite: this.fcBillingSite.value,
      billingCostCentre: this.fcBillingCostCenter.value,
      workflowAction: this.workflowAction
    });
  }

  /**
   * Sets the order description based on the order details
   */
  private _setOrderDescription(): void {
    if (!this.hasOrder) { return; }
    this.orderDescription = `${this.order.description} - ${
      this._dateTimeService.formatDate(this.order.createdOn, 'shortDate')}`;
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
    this.orderDatasource = new McsTableDataSource(orderItems || []);

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

    // Register Form Groups using binding
    this.fgOrderBilling = new FormGroup({
      fcContractTerm: this.fcContractTerm,
      fcBillingEntity: this.fcBillingEntity,
      fcBillingSite: this.fcBillingSite,
      fcBillingCostCenter: this.fcBillingCostCenter
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
}
