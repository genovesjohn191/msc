import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import {
  getSafeProperty,
  isNullOrEmpty,
  deleteArrayRecord
} from '@app/utilities';
import {
  McsOrder,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItem,
  McsOrderItemCreate,
  McsOrderUpdate
} from '@app/models';
import { OrdersApiService } from '../api-services/orders-api.service';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> {
  private _createdOrdersMap = new Map<string, McsOrder>();

  constructor(private _ordersApiService: OrdersApiService) {
    super(new McsOrdersDataContext(_ordersApiService));
  }

  public createOrderWorkflow(id: any, workflowDetails: McsOrderWorkflow): Observable<McsOrder> {
    return this._ordersApiService.createOrderWorkflow(id, workflowDetails).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createOrder(orderData: McsOrderCreate): Observable<McsOrder> {
    return this._ordersApiService.createOrder(orderData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this._appendCreatedOrder(order))
    );
  }

  public getOrderWorkflow(id: any): Observable<McsOrderItem> {
    return this._ordersApiService.getOrderWorkflow(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateOrder(
    id: any,
    description: string,
    duration: number,
    newItems: McsOrderItemCreate[],
    oldItems: McsOrderItemCreate[]
  ): Observable<McsOrder> {
    let updatedDetails = this._updateOrderLineItems(
      id,
      description,
      duration,
      newItems,
      oldItems
    );
    return this._ordersApiService.updateOrder(id, updatedDetails).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteOrder(id: any): Observable<McsOrder> {
    return this._ordersApiService.deleteOrder(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  private _appendCreatedOrder(order: McsOrder): void {
    let orderFound = this._createdOrdersMap.get(order.id);
    if (orderFound) {
      throw new Error(`Order with id: ${order.id} was already exist on the map.`);
    }
    this._createdOrdersMap.set(order.id, order);
  }

  private _updateOrderLineItems(
    orderId: string,
    orderDesription: string,
    orderDuration: number,
    newOrderItems: McsOrderItemCreate[],
    oldItemOrders: McsOrderItemCreate[]
  ): McsOrderUpdate {
    let orderUpdateDetails = new McsOrderUpdate();
    orderUpdateDetails.description = orderDesription;
    orderUpdateDetails.contractDuration = orderDuration;

    // Clear the old item orders on the order list
    let existingOrder = this._createdOrdersMap.get(orderId);
    if (isNullOrEmpty(existingOrder)) { return undefined; }
    this._removeLineItemsFromOrder(existingOrder, oldItemOrders);

    // Add the original order item data first
    existingOrder.items.forEach((item) => {
      let orderItemUpdate = new McsOrderItemCreate();
      orderItemUpdate.referenceId = item.referenceId;
      orderItemUpdate.properties = item.properties;
      orderItemUpdate.parentServiceId = item.serviceId;
      orderItemUpdate.parentReferenceId = item.parentReferenceId;
      orderItemUpdate.itemOrderTypeId = item.itemOrderTypeId;
      orderUpdateDetails.items.push(orderItemUpdate);
    });
    // Merge the new line items into original order
    orderUpdateDetails.items.push(...newOrderItems);
    return orderUpdateDetails;
  }

  private _removeLineItemsFromOrder(order: McsOrder, orderItems: McsOrderItemCreate[]): void {
    if (isNullOrEmpty(order)) { return; }
    orderItems.forEach((addOn) => {
      deleteArrayRecord(
        order.items, (recordItem) => recordItem.referenceId === addOn.referenceId
      );
    });
  }
}
