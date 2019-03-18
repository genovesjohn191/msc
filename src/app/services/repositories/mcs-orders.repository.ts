import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';
import {
  McsRepositoryBase,
  IMcsOrderFactory
} from '@app/core';
import { getSafeProperty } from '@app/utilities';
import {
  McsOrder,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItem,
  McsBilling
} from '@app/models';
import { OrdersApiService } from '../api-services/orders-api.service';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> implements IMcsOrderFactory {

  constructor(private _ordersApiService: OrdersApiService) {
    super(new McsOrdersDataContext(_ordersApiService));
  }

  /**
   * Creates an order and send the request to api
   * @param orderData Order details to be created
   */
  public createOrder(orderData: McsOrderCreate): Observable<McsOrder> {
    return this._ordersApiService.createOrder(orderData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.addOrUpdate(order))
    );
  }

  /**
   * Create order workflow based on the workflow action
   * @param orderId Order id to be created
   * @param workflow Workflow details
   */
  public createOrderWorkFlow(orderId: string, workflow: McsOrderWorkflow): Observable<McsOrder> {
    return this._ordersApiService.createOrderWorkflow(orderId, workflow).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.addOrUpdate(order))
    );
  }

  /**
   * Gets the order workflow details by id
   * @param id Id of the order to be obtained
   */
  public getOrderWorkflow(id: any): Observable<McsOrderItem> {
    return this._ordersApiService.getOrderWorkflow(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Updates the order based on the order id provided
   * @param orderId Order id to be obtained
   * @param updatedOrder Updated order details to be set on the existing order
   */
  public updateOrder(orderId: string, updatedOrder: McsOrderCreate): Observable<McsOrder> {
    return this._ordersApiService.updateOrder(orderId, updatedOrder).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.addOrUpdate(order))
    );
  }

  /**
   * Deletes a corresponding order based on id
   * @param id Id of the order to be deleted
   */
  public deleteOrder(id: any): Observable<McsOrder> {
    return this._ordersApiService.deleteOrder(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.delete(order))
    );
  }

  /**
   * Gets the order billing details
   */
  public getBilling(): Observable<McsBilling[]> {
    return this._ordersApiService.getBilling().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }
}
