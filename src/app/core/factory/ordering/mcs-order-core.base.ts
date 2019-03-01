import {
  Observable,
  Subject,
  empty,
  throwError
} from 'rxjs';
import {
  takeUntil,
  tap,
  catchError,
  exhaustMap,
  finalize
} from 'rxjs/operators';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrUndefined,
  getSafeProperty,
  cloneObject,
  compareJsons,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrderCreate,
  McsOrder,
  McsOrderWorkflow,
  DataStatus,
  ActionStatus,
  McsOrderItemCreate,
  McsJob
} from '@app/models';
import { IMcsErrorable } from '../../interfaces/mcs-errorable.interface';
import { IMcsJobable } from '../../interfaces/mcs-jobable.interface';
import { IMcsStateChangeable } from '../../interfaces/mcs-state-changeable.interface';
import { McsOrderBuilder } from './mcs-order.builder';
import { McsOrderRequest } from './mcs-order-request';
import { McsOrderDirector } from './mcs-order.director';
import { IMcsOrderFactory } from './mcs-order-factory.interface';

export interface IOrderSubmitDetails {
  description: string;
  contractDuration: number;
  workflowDetails: McsOrderWorkflow;
}

export abstract class McsOrderCoreBase implements IMcsJobable, IMcsErrorable,
  IMcsStateChangeable, McsDisposable {

  // Order builders and director
  private _orderBuilder: McsOrderBuilder;
  private _orderDirector: McsOrderDirector;

  // Order content
  private _createdOrder: McsOrder;
  private _pendingOrderRequest: McsOrderRequest;
  private _inProgressRequest: McsOrderRequest;

  // Events for controlling events
  private _orderChange = new Subject<McsOrder>();
  private _orderRequestedSubject = new Subject<void>();
  private _dataStatusChange = new Subject<DataStatus>();
  private _jobsChange = new Subject<McsJob[]>();
  private _errorsChange = new Subject<string[]>();

  constructor(private _orderFactory: IMcsOrderFactory) {
    this._orderBuilder = new McsOrderBuilder();
    this._orderDirector = new McsOrderDirector();
    this._subscribeAndExecuteNewOrder();
  }

  /**
   * Returns the order id once it was created
   */
  public get orderId(): string {
    return getSafeProperty(this._createdOrder, (obj) => obj.id);
  }

  /**
   * Returns the main order reference ID
   */
  public get orderReferenceId(): string {
    return getSafeProperty(this._createdOrder, (obj) => obj.items[0].referenceId) ||
      getSafeProperty(this._orderBuilder,
        (obj) => obj.orderRequestDetails.orderDetails.items[0].referenceId
      );
  }

  /**
   * Returns the main order service ID
   */
  public get orderServiceId(): string {
    return getSafeProperty(this._createdOrder, (obj) => obj.items[0].serviceId) ||
      getSafeProperty(this._orderBuilder,
        (obj) => obj.orderRequestDetails.orderDetails.items[0].parentServiceId
      );
  }

  /**
   * Event that emits when an order has been changed
   */
  public orderChange(): Observable<McsOrder> {
    return this._orderChange.asObservable();
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
   * Creates or Update the order details
   * @param orderDetails The details of the order to be created
   */
  public createOrUpdateOrder(orderDetails: McsOrderCreate): void {
    this._orderBuilder
      .setDescription(orderDetails.description)
      .setContractDuration(orderDetails.contractDuration)
      .setOrderWorkflow(null);
    orderDetails.items.forEach((item) => this._orderBuilder.addOrUpdateOrderItem(item));
    this._orderDirector.construct(this._orderBuilder);
  }

  /**
   * Add or update the order items
   * @param orderItem Order item to be created or updated
   */
  public addOrUpdateOrderItem(orderItem: McsOrderItemCreate): void {
    this._orderBuilder.addOrUpdateOrderItem(orderItem);
    this._orderDirector.construct(this._orderBuilder);
  }

  /**
   * Deletes the order item based on its reference id
   * @param orderItemRefId Order item reference id to be deleted
   */
  public deleteOrderItemByRefId(orderItemRefId: string): void {
    this._orderBuilder.deleteOrderItemByRefId(orderItemRefId);
    this._orderDirector.construct(this._orderBuilder);
  }

  /**
   * Creates the order workflow based on the details provided
   * @param workflow Workflow details to be submitted
   */
  public createOrderWorkFlow(workflow: McsOrderWorkflow): Observable<McsOrder> {
    return this._orderFactory.createOrderWorkFlow(this._createdOrder.id, workflow).pipe(
      tap((response) => this.setJobs(...response.jobs)),
      catchError((httpError) => {
        this.setErrors(...httpError.errorMessages);
        return throwError(httpError);
      })
    );
  }

  /**
   * Updates and submit the order at once
   * @param details The details of the order to be submitted
   */
  public updateAndSubmitOrder(details: IOrderSubmitDetails): void {
    this._orderBuilder
      .setDescription(details.description)
      .setContractDuration(details.contractDuration)
      .setOrderWorkflow(details.workflowDetails);
    this._orderDirector.construct(this._orderBuilder);
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
    this._orderDirector.orderRequestReceived().pipe(
      takeUntil(this._orderRequestedSubject),
      tap((orderRequest) =>
        this._pendingOrderRequest = cloneObject(orderRequest)
      ),
      exhaustMap((response) => this._executeOrderRequest(response))
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

    let requesterFunc = requesterAction === ActionStatus.Add ?
      this._createOrder.bind(this, requestDetails.orderDetails) :
      this._updateOrder.bind(this, this._createdOrder.id, requestDetails.orderDetails);

    this._setRequestChangeState(DataStatus.InProgress);
    this._inProgressRequest = cloneObject(requestDetails);

    return requesterFunc().pipe(
      tap((order) => {
        this._createdOrder = order as McsOrder;
        this._orderChange.next(this._createdOrder);

        this._setRequestChangeState(DataStatus.Success);
        this._executeWorkflowAction(requestDetails.workflowDetails);
      }),
      catchError((httpError) => {
        this._setRequestChangeState(DataStatus.Error);
        this.setErrors(...httpError.errorMessages);
        return empty();
      }),
      finalize(() => this._executePendingRequest())
    );
  }

  /**
   * Executes the pending request right after the inprogress request
   */
  private _executePendingRequest(): void {
    if (!this._hasPendingRequest()) { return; }
    this._executeOrderRequest(this._pendingOrderRequest).subscribe();
  }

  /**
   * Execute the request action of the order
   * @param workflowDetails Workflow details to be executed
   */
  private _executeWorkflowAction(workflowDetails: McsOrderWorkflow): void {
    let workflowState = getSafeProperty(workflowDetails, (obj) => obj.state);
    if (isNullOrEmpty(workflowState)) { return; }

    this.createOrderWorkFlow(workflowDetails).subscribe();
  }

  /**
   * Creates the order based on the order details
   * @param orderDetails Details of the order to be created
   */
  private _createOrder(orderDetails: McsOrderCreate): Observable<McsOrder> {
    return this._orderFactory.createOrder(orderDetails);
  }

  /**
   * Updates the order based on the order details
   * @param orderId Order id to be updated
   * @param orderDetails Updated details of the order to be patched
   */
  private _updateOrder(orderId: string, orderDetails: McsOrderCreate): Observable<McsOrder> {
    return this._orderFactory.updateOrder(orderId, orderDetails);
  }

  /**
   * Sets the request change state according to its status
   * @param state State change of the order if there is ongoing request
   */
  private _setRequestChangeState(state: DataStatus): void {
    if (this._hasPendingRequest()) {
      this.setChangeState(DataStatus.InProgress);
      return;
    }
    this.setChangeState(state);
  }

  /**
   * Returns true when the order has a pending request
   */
  private _hasPendingRequest(): boolean {
    return !isNullOrUndefined(this._pendingOrderRequest) &&
      compareJsons(this._inProgressRequest, this._pendingOrderRequest) !== 0;
  }
}
