import {
  isNullOrUndefined,
  deleteArrayRecord,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrderItemCreate,
  DeliveryType
} from '@app/models';
import {
  McsOrderRequest,
  OrderRequester
} from './mcs-order-request';

export class McsOrderBuilder {
  private _description: string;
  private _contractDurationMonths: number;
  private _billingEntityId: number;
  private _billingSiteId: number;
  private _billingCostCentreId: number;
  private _orderRequester: OrderRequester;
  private _orderItems: McsOrderItemCreate[];
  private _orderRequestDetails: McsOrderRequest;

  constructor() {
    this._description = '';
    this._contractDurationMonths = null;
    this._billingEntityId = 0;
    this._billingSiteId = 0;
    this._billingCostCentreId = 0;
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
   * Sets the billing entity id
   * @param entityId Billing entity id to be set
   */
  public setBillingEntityId(entityId: number): McsOrderBuilder {
    this._billingEntityId = entityId;
    return this;
  }

  /**
   * Sets the billing site id
   * @param siteId Billing site id to be set
   */
  public setBillingSiteId(siteId: number): McsOrderBuilder {
    this._billingSiteId = siteId;
    return this;
  }

  /**
   * Sets the billing cost centre id
   * @param costCentreId Cost centre id to be set
   */
  public setBillingCostCentreId(costCentreId: number): McsOrderBuilder {
    this._billingCostCentreId = costCentreId;
    return this;
  }

  /**
   * Sets the order requester accordingly
   * @param requester Requester to be set
   */
  public setOrderRequester(requester: OrderRequester): McsOrderBuilder {
    this._orderRequester = requester;
    return this;
  }

  /**
   * Sets the order items delivery type
   * @param deliveryType delivery type value
   */
  public setOrderItemDeliveryType(deliveryType: DeliveryType): McsOrderBuilder {
    this._orderItems.forEach((item) => item.deliveryType = deliveryType);
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
   * Clear all order items
   */
  public clearOrderItems(): McsOrderBuilder {
    this._orderItems = [];
    return this;
  }

  /**
   * Build the generic details of the order
   */
  public buildOrderDetails(): McsOrderBuilder {
    this._orderRequestDetails.orderDetails.contractDurationMonths = this._contractDurationMonths;
    this._orderRequestDetails.orderDetails.description = this._description;
    this._orderRequestDetails.orderDetails.billingEntityId = this._billingEntityId;
    this._orderRequestDetails.orderDetails.billingSiteId = this._billingSiteId;
    this._orderRequestDetails.orderDetails.billingCostCentreId = this._billingCostCentreId;
    this._orderRequestDetails.orderRequester = this._orderRequester;
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
