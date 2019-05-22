import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
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
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrder,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItem,
  McsBilling,
  McsOrderApprover,
  McsOrderItemType,
  McsQueryParam
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsApiClientFactory,
  McsApiOrdersFactory,
  IMcsApiOrdersService
} from '@app/api-client';
import { McsOrdersDataContext } from '../data-context/mcs-orders-data.context';

@Injectable()
export class McsOrdersRepository extends McsRepositoryBase<McsOrder> implements IMcsOrderFactory {
  private readonly _ordersApiService: IMcsApiOrdersService;
  private _itemTypesCache: Map<string, McsOrderItemType>;

  constructor(
    _apiClientFactory: McsApiClientFactory,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    super(new McsOrdersDataContext(
      _apiClientFactory.getService(new McsApiOrdersFactory())
    ));
    this._ordersApiService = _apiClientFactory.getService(new McsApiOrdersFactory());
    this._itemTypesCache = new Map();
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

  /**
   * Get the order items types (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getOrderItemTypes(query?: McsQueryParam): Observable<McsOrderItemType[]> {
    return this._ordersApiService.getOrderItemTypes(query).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Gets the order item type by id
   * @param typeId Type id of the order to be obtained
   */
  public getItemOrderType(typeId: string): Observable<McsOrderItemType> {
    let typeFound = this._itemTypesCache.get(typeId);
    if (!isNullOrEmpty(typeFound)) { return of(typeFound); }

    return this._ordersApiService.getOrderItemType(typeId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      tap((response) => this._itemTypesCache.set(typeId, response))
    );
  }
}
