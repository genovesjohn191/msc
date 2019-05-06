import {
  isNullOrUndefined,
  deleteArrayRecord,
  isNullOrEmpty
} from '@app/utilities';
import { McsOrderItemCreate } from '@app/models';
import { McsOrderRequest } from './mcs-order-request';

export class McsOrderBuilder {
  private _description: string;
  private _contractDurationMonths: number;
  private _billingSiteId: string;
  private _billingCostCentreId: string;
  private _orderItems: McsOrderItemCreate[];
  private _orderRequestDetails: McsOrderRequest;

  constructor() {
    this._description = '';
    this._contractDurationMonths = null;
    this._billingSiteId = '';
    this._billingCostCentreId = '';
    this._orderItems = [];
    this._orderRequestDetails = new McsOrderRequest();
  }

  /**
   * Returns the order request details
   */
  public get orderRequestDetails(): McsOrderRequest {
    return this._orderRequestDetails;
  }

  /**
   * Sets the order description
   * @param description Description of the order to be set
   */
  public setDescription(description: string): McsOrderBuilder {
    this._description = description;
    return this;
  }

  /**
   * Sets the contract duration of the order
   * @param duration Duration of the order to be set
   */
  public setContractDuration(duration: number): McsOrderBuilder {
    this._contractDurationMonths = duration;
    return this;
  }

  /**
   * Sets the billing site id
   * @param siteId Billing site id to be set
   */
  public setBillingSiteId(siteId: string): McsOrderBuilder {
    this._billingSiteId = siteId;
    return this;
  }

  /**
   * Sets the billing cost centre id
   * @param costCentreId Cost centre id to be set
   */
  public setBillingCostCentreId(costCentreId: string): McsOrderBuilder {
    this._billingCostCentreId = costCentreId;
    return this;
  }

  /**
   * Add or updates the order item
   * @param orderItem Order item to be added or updated
   */
  public addOrUpdateOrderItem(orderItem: McsOrderItemCreate): McsOrderBuilder {
    if (isNullOrUndefined(orderItem)) { return; }

    let orderItemFound = this._orderItems.find((existingItem) =>
      existingItem.referenceId === orderItem.referenceId
    );
    isNullOrUndefined(orderItemFound) ?
      this._orderItems.push(orderItem) :
      Object.assign(orderItemFound, orderItem);
    return this;
  }

  /**
   * Deletes the exisiting order item
   * @param orderItem Order item to be deleted
   */
  public deleteOrderItem(orderItem: McsOrderItemCreate): McsOrderBuilder {
    if (isNullOrUndefined(orderItem)) { return; }
    this.deleteOrderItemByRefId(orderItem.referenceId);
    return this;
  }

  /**
   * Delete the order item based on its reference id
   * @param referenceId Reference id of the order to be deleted
   */
  public deleteOrderItemByRefId(referenceId: string): McsOrderBuilder {
    if (isNullOrEmpty(referenceId)) { return; }
    this._orderItems = deleteArrayRecord(
      this._orderItems,
      (orderItem) => orderItem.referenceId === referenceId
    );
    return this;
  }

  /**
   * Build the generic details of the order
   */
  public buildOrderDetails(): McsOrderBuilder {
    this._orderRequestDetails.orderDetails.contractDurationMonths = this._contractDurationMonths;
    this._orderRequestDetails.orderDetails.description = this._description;
    this._orderRequestDetails.orderDetails.billingSiteId = this._billingSiteId;
    this._orderRequestDetails.orderDetails.billingCostCentreId = this._billingCostCentreId;
    return this;
  }

  /**
   * Build the order items of the order
   */
  public buildOrderItem(): McsOrderBuilder {
    this._orderRequestDetails.orderDetails.items = this._orderItems;
    return this;
  }
}
