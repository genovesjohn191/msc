import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  McsTableDataSource,
  CoreValidators,
  McsDateTimeService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderItem
} from '@app/models';
import { FormGroupDirective } from '@app/shared';
import { OrderDetails } from './order-details-step';

@Component({
  selector: 'mcs-order-details-step',
  templateUrl: 'order-details-step.component.html'
})

export class OrderDetailsStepComponent implements OnChanges {
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
  public workflowAction: OrderWorkflowAction;
  public orderDescription: string;
  public orderDatasource: McsTableDataSource<McsOrderItem>;
  public orderDataColumns: string[] = [];

  @ViewChild(FormGroupDirective)
  private _formGroup: FormGroupDirective;

  constructor(
    private _translate: TranslateService,
    private _dateTimeService: McsDateTimeService
  ) {
    this.workflowAction = OrderWorkflowAction.Submitted;
    this._registerFormGroup();
    this._setDataColumns();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let orderChange = changes['order'];
    if (!isNullOrEmpty(orderChange)) {
      this._initializeOrderDatasource();
      this._setOrderDescription();
    }
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
      this._formGroup.setFocusToInvalidElement();
      return;
    }

    this.submitOrder.next({
      description: this.orderDescription,
      contractDuration: this.fcContractTerm.value,
      billingEntity: this.fcBillingEntity.value,
      billingSite: this.fcBillingSite.value,
      billingCustomCenter: this.fcBillingCostCenter.value,
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
    this.orderDatasource = new McsTableDataSource(this.order.items || []);

    // Add the total charges on the datasource
    this.orderDatasource.addOrUpdateRecord({
      description: 'Total',
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
    // Register Form Controls
    this.fcContractTerm = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcBillingEntity = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcBillingSite = new FormControl('', [
      CoreValidators.required
    ]);

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
}
