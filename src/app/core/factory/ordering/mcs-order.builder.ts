import {
  isNullOrUndefined,
  deleteArrayRecord,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrderItemCreate,
  McsOrderWorkflow
} from '@app/models';
import { McsOrderRequest } from './mcs-order-request';

export class McsOrderBuilder {
  private _description: string;
  private _contractDuration: number;
  private _orderItems: McsOrderItemCreate[];
  private _orderWorkflow: McsOrderWorkflow;
  private _orderRequestDetails: McsOrderRequest;

  constructor() {
    this._description = '';
    this._contractDuration = 0;
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
    this._contractDuration = duration;
    return this;
  }

  /**
   * Sets the order workflow details
   * @param workflow Workflow details of the order to be set
   */
  public setOrderWorkflow(workflow: McsOrderWorkflow): McsOrderBuilder {
    this._orderWorkflow = workflow;
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
    this._orderRequestDetails.orderDetails.contractDuration = this._contractDuration;
    this._orderRequestDetails.orderDetails.description = this._description;
    return this;
  }

  /**
   * Build the order items of the order
   */
  public buildOrderItem(): McsOrderBuilder {
    this._orderRequestDetails.orderDetails.items = this._orderItems;
    return this;
  }

  /**
   * Build the order workflow details of the order
   */
  public buildOrderWorkflow(): McsOrderBuilder {
    this._orderRequestDetails.workflowDetails = this._orderWorkflow;
    return this;
  }
}
