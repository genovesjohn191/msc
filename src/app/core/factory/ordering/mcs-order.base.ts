import {
  of,
  throwError,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ActionStatus,
  DataStatus,
  DeliveryType,
  ItemType,
  McsApiErrorContext,
  McsJob,
  McsOrder,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderItemType,
  McsOrderWorkflow
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  exhaustLatestMap,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  McsDisposable
} from '@app/utilities';

import { IMcsFallible } from '../../interfaces/mcs-fallible.interface';
import { IMcsJobManager } from '../../interfaces/mcs-job-manager.interface';
import { IMcsStateChangeable } from '../../interfaces/mcs-state-changeable.interface';
import {
  McsOrderRequest,
  OrderRequester
} from './mcs-order-request';
import { McsOrderBuilder } from './mcs-order.builder';
import {
  McsOrderDirector,
  OrderStateChange
} from './mcs-order.director';

const DEFAULT_ORDER_DESCRIPTION = 'Macquarie Cloud Services Portal Order';

export interface IOrderSubmitDetails {
  description: string;
  contractDurationMonths: number;
  billingSiteId: string;
  billingCostCentreId: string;
}

export abstract class McsOrderBase implements IMcsJobManager, IMcsFallible, IMcsStateChangeable, McsDisposable {

  // Order builders and director
  private _orderBuilder: McsOrderBuilder;
  private _orderDirector: McsOrderDirector;

  // Order content
  private _createdOrder: McsOrder;
  private _orderReferenceId: string;
  private _orderServiceId: string;

  // Events for controlling events
  private _orderStatus: DataStatus;
  private _orderChange = new Subject<McsOrder>();
  private _orderItemTypeChange = new BehaviorSubject<McsOrderItemType>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(DataStatus.Empty);
  private _orderRequestedSubject = new Subject<void>();
  private _jobsChange = new Subject<McsJob[]>();
  private _errorsChange = new Subject<string[]>();

  constructor(
    private _orderApiService: McsApiService,
    private _orderItemProductType: string
  ) {
    this._orderBuilder = new McsOrderBuilder();
    this._orderDirector = new McsOrderDirector();
    this._subscribeAndExecuteNewOrder();
    this._subscribeToOrderPreChange();
    this._subscribeToOrderItemType();
  }

  /**
   * Returns the created order, otherwise the order was not yet created
   */
  public get order(): McsOrder {
    return this._createdOrder;
  }

  /**
   * Returns the main order reference ID
   */
  public get orderReferenceId(): string {
    return this._orderReferenceId;
  }

  /**
   * Returns the main order service ID
   */
  public get orderServiceId(): string {
    return this._orderServiceId;
  }

  /**
   * Event that emits when an order has been changed
   */
  public orderChange(): Observable<McsOrder> {
    return this._orderChange.asObservable();
  }

  /**
   * Event that emits when the order item has been received or changed
   */
  public orderItemTypeChange(): Observable<McsOrderItemType> {
    return this._orderItemTypeChange.asObservable().pipe(
      filter((response) => !isNullOrEmpty(response))
    );
  }

  /**
   * Event that emits when the state of the order has been changed
   */
  public stateChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  /**
   * Event that emits when the job has been changed
   */
  public jobsChange(): Observable<McsJob[]> {
    return this._jobsChange.asObservable();
  }

  /**
   * Event that emits when the error has been changed
   */
  public errorsChange(): Observable<string[]> {
    return this._errorsChange.asObservable();
  }

  /**
   * Create default order description based on order description
   * @param description Description of order details
   */
  public createDefaultOrderDescription(itemType: ItemType, description: string): string {
    return `${itemType} ${description}`;
  }

  /**
   * Creates or Update the order details
   * @param orderDetails The details of the order to be created
   */
  public createOrUpdateOrder(
    orderDetails: McsOrderCreate,
    orderRequester: OrderRequester = OrderRequester.Client,
    orderDeliveryType?: DeliveryType,
    schedule?: string
  ): void {
    let orderItemType = this._orderItemTypeChange.getValue() || {} as any;

    let orderDescription = orderDetails.description || this._getOrderDescriptionByType(orderItemType);
    let orderContract = orderItemType.contractTermApplicable ? orderDetails.contractDurationMonths : null;

    this._orderBuilder
      .setDescription(orderDescription)
      .setContractDuration(orderContract)
      .setBillingEntityId(orderDetails.billingEntityId)
      .setBillingSiteId(orderDetails.billingSiteId)
      .setBillingCostCentreId(orderDetails.billingCostCentreId)
      .setOrderRequester(orderRequester);

    if (!isNullOrUndefined(orderDeliveryType)) {
      this._orderBuilder.setOrderItemDeliveryType(orderDeliveryType);
    }

    if (!isNullOrUndefined(schedule)) {
      this._orderBuilder.setOrderItemSchedule(schedule);
    }

    let orderItems = getSafeProperty(orderDetails, (obj) => obj.items);
    if (!isNullOrEmpty(orderItems)) {
      this._orderReferenceId = orderItems[0].referenceId;
      this._orderServiceId = orderItems[0].serviceId;
      orderItems.forEach((item) => this._orderBuilder.addOrUpdateOrderItem(item));
    }
  }

  /**
   * Add or update the order items
   * @param orderItem Order item to be created or updated
   */
  public addOrUpdateOrderItem(orderItem: McsOrderItemCreate): void {
    this._orderBuilder.addOrUpdateOrderItem(orderItem);
  }

  /**
   * Deletes the order item based on its reference id
   * @param orderItemRefId Order item reference id to be deleted
   */
  public deleteOrderItemByRefId(orderItemRefId: string): void {
    this._orderBuilder.deleteOrderItemByRefId(orderItemRefId);
  }

  /**
   * Clear all order items
   */
  public clearOrderItems(): void {
    this._orderBuilder.clearOrderItems();
  }

  /**
   * Submits the order request based on the constructed details
   * @important The order request will not be submitted once the data is the same as the previous request
   */
  public submitOrderRequest(): void {
    if (isNullOrEmpty(this._orderBuilder)) {
      throw new Error('Cannot submit the order of undefined order builder.');
    }
    this._orderDirector.construct(this._orderBuilder);
  }

  /**
   * Submits the order workflow based on the details provided
   * @param workflow Workflow details to be submitted
   */
  public submitOrderWorkflow(workflow: McsOrderWorkflow): Observable<McsOrder> {
    if (isNullOrEmpty(this._createdOrder)) {
      throw new Error('Cannot submit order workflow because the order has not been created yet.');
    }

    return this._orderApiService.createOrderWorkFlow(this._createdOrder.id, workflow).pipe(
      tap((response) => {
        let orderJobs = getSafeProperty(response, (obj) => obj.jobs, []);
        this.setJobs(...orderJobs);
        this._setRequestChangeState(DataStatus.Success);
      }),
      catchError((httpError: McsApiErrorContext) => {
        if (!isNullOrEmpty(httpError)) {
          let errorMessages = getSafeProperty(httpError, (obj) => obj.details.errorMessages, []);
          this.setErrors(...errorMessages);
        }
        this._setRequestChangeState(DataStatus.Error);
        return throwError(httpError);
      })
    );
  }

  /**
   * Disposes the order based implementations
   */
  public dispose(): void {
    unsubscribeSafely(this._orderChange);
    unsubscribeSafely(this._orderRequestedSubject);
    unsubscribeSafely(this._dataStatusChange);
    unsubscribeSafely(this._jobsChange);
    unsubscribeSafely(this._errorsChange);
  }

  /**
   * Sets the change state to the event
   * @param dataStatus Data status to be emitted
   */
  public setChangeState(dataStatus: DataStatus): void {
    this._dataStatusChange.next(dataStatus);
  }

  /**
   * Sets the jobs to the event
   * @param jobs Jobs to be emitted
   */
  public setJobs(...jobs: McsJob[]): void {
    this._jobsChange.next(jobs);
  }

  /**
   * Sets the error to the event
   * @param errorMessages Error messages to be emitted
   */
  public setErrors(...errorMessages: string[]): void {
    this._errorsChange.next(errorMessages);
  }

  /**
   * Subscribes and execute the order once there are no pending request,
   * otherwise the new order will be appended to the queue and it will immediately
   * emitted once the previous order was completed.
   */
  private _subscribeAndExecuteNewOrder(): void {
    this._orderDirector.orderRequestChange().pipe(
      takeUntil(this._orderRequestedSubject),
      exhaustLatestMap((response) => this._executeOrderRequest(response))
    ).subscribe();
  }

  /**
   * Executes the order based on the provided request details, and it will judge
   * if the order should be created or updated
   * @param requestDetails Request details of the order to be requested
   */
  private _executeOrderRequest(requestDetails: McsOrderRequest): Observable<any> {
    let requesterAction = isNullOrUndefined(this._createdOrder) ?
      ActionStatus.Add : ActionStatus.Update;

    // TODO: This changes is for temporary checking of ordering wizard,
    // remove this if necessary including the OrderRequester enumeration
    let cancelUpdateRequest = requesterAction === ActionStatus.Update &&
      requestDetails.orderRequester !== OrderRequester.Billing &&
      !CommonDefinition.ORDERING_ENABLE_PRICING_CALCULATOR;
    if (cancelUpdateRequest) { return of(null); }

    let requesterFunc = requesterAction === ActionStatus.Add ?
      this._createOrder.bind(this, requestDetails.orderDetails) :
      this._updateOrder.bind(this, this._createdOrder.id, requestDetails.orderDetails);

    this._setRequestChangeState(DataStatus.Active);
    return requesterFunc().pipe(
      tap((order) => {
        this._createdOrder = order as McsOrder;
        this._orderChange.next(this._createdOrder);
        this._orderStatus = DataStatus.Success;
        this._setRequestChangeState(DataStatus.Success);
      }),
      catchError((httpError: McsApiErrorContext) => {
        this._orderStatus = DataStatus.Error;
        this._setRequestChangeState(DataStatus.Error);

        if (!isNullOrEmpty(httpError)) {
          let errorMessages = getSafeProperty(httpError, (obj) => obj.details.errorMessages, []);
          this.setErrors(...errorMessages);
        }
        return EMPTY;
      })
    );
  }

  /**
   * Creates the order based on the order details
   * @param orderDetails Details of the order to be created
   */
  private _createOrder(orderDetails: McsOrderCreate): Observable<McsOrder> {
    return this._orderApiService.createOrder(orderDetails);
  }

  /**
   * Updates the order based on the order details
   * @param orderId Order id to be updated
   * @param orderDetails Updated details of the order to be patched
   */
  private _updateOrder(orderId: string, orderDetails: McsOrderCreate): Observable<McsOrder> {
    return this._orderApiService.updateOrder(orderId, orderDetails);
  }

  /**
   * Gets the order description
   * @param orderTypeDetails Order type to be checked
   */
  private _getOrderDescriptionByType(orderTypeDetails: McsOrderItemType): string {
    return orderTypeDetails.description || DEFAULT_ORDER_DESCRIPTION;
  }

  /**
   * Sets the request change state according to its status
   * @param state State change of the order if there is ongoing request
   */
  private _setRequestChangeState(state: DataStatus): void {
    this.setChangeState(state);
  }

  /**
   * Subscribes to order pre changed event
   */
  private _subscribeToOrderPreChange(): void {
    if (isNullOrEmpty(this._orderDirector)) { return; }

    this._orderDirector.orderRequestStateChange().pipe(
      takeUntil(this._orderRequestedSubject),
      tap((orderState) => {
        orderState === OrderStateChange.Started ?
          this._setRequestChangeState(DataStatus.PreActive) :
          this._setRequestChangeState(this._orderStatus);
      }),
    ).subscribe();
  }

  /**
   * Subscribes to order item type
   */
  private _subscribeToOrderItemType(): void {
    if (isNullOrEmpty(this._orderItemProductType)) { return; }

    // Get all the orders here
    this._orderApiService.getOrderItemTypes({ keyword: this._orderItemProductType }).pipe(
      map((orderItemDetails) => getSafeProperty(orderItemDetails, (obj) => obj.collection[0])),
      catchError(() => EMPTY)
    ).subscribe((itemType) => {
      if (isNullOrEmpty(itemType)) {
        throw new Error('Unable to create an order without order item type.');
      }
      this._orderItemTypeChange.next(itemType);
    });
  }
}
