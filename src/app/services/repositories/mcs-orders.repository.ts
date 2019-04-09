import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  tap,
  finalize
} from 'rxjs/operators';
import {
  McsRepositoryBase,
  IMcsOrderFactory,
  CoreEvent
} from '@app/core';
import { getSafeProperty } from '@app/utilities';
import {
  McsOrder,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItem,
  McsBilling,
  McsOrderApprover
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { OrdersApiService } from '../api-services/orders-api.service';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> implements IMcsOrderFactory {

  constructor(
    private _ordersApiService: OrdersApiService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
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
    this._eventDispatcher.dispatch(CoreEvent.orderStateBusy, orderId);

    return this._ordersApiService.createOrderWorkflow(orderId, workflow).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.addOrUpdate(order)),
      finalize(() => this._eventDispatcher.dispatch(CoreEvent.orderStateEnded, orderId))
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
    this._eventDispatcher.dispatch(CoreEvent.orderStateBusy, orderId);

    return this._ordersApiService.updateOrder(orderId, updatedOrder).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.addOrUpdate(order)),
      finalize(() => this._eventDispatcher.dispatch(CoreEvent.orderStateEnded, orderId))
    );
  }

  /**
   * Deletes a corresponding order based on id
   * @param orderId Id of the order to be deleted
   */
  public deleteOrder(orderId: any): Observable<McsOrder> {
    this._eventDispatcher.dispatch(CoreEvent.orderStateBusy, orderId);

    return this._ordersApiService.deleteOrder(orderId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((order) => this.delete(order)),
      finalize(() => this._eventDispatcher.dispatch(CoreEvent.orderStateEnded, orderId))
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

  /**
   * Gets the order approvers
   */
  public getOrderApprovers(): Observable<McsOrderApprover[]> {
    return this._ordersApiService.getOrderApprovers().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }
}
