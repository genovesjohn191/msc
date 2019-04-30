import { formatDate } from '@angular/common';
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
import { CoreDefinition } from '@app/core';
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
  McsJob,
  OrderWorkflowAction,
  McsApiJobRequestBase
} from '@app/models';
import { IMcsFallible } from '../../interfaces/mcs-fallible.interface';
import { IMcsJobManager } from '../../interfaces/mcs-job-manager.interface';
import { IMcsStateChangeable } from '../../interfaces/mcs-state-changeable.interface';
import { McsOrderBuilder } from './mcs-order.builder';
import { McsOrderRequest } from './mcs-order-request';
import { McsOrderDirector } from './mcs-order.director';
import { IMcsOrderFactory } from './mcs-order-factory.interface';

export interface IOrderSubmitDetails {
  description: string;
  contractDurationMonths: number;
  billingSiteId: string;
  billingCostCentreId: string;
}

export abstract class McsOrderBase implements IMcsJobManager, IMcsFallible,
  IMcsStateChangeable, McsDisposable {

  // Order builders and director
  private _orderBuilder: McsOrderBuilder;
  private _orderDirector: McsOrderDirector;
  private _workflowMapTable: Map<OrderWorkflowAction, (jobReference: McsApiJobRequestBase) => Observable<McsOrder>>;

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
    this._workflowMapTable = new Map();
    this._orderBuilder = new McsOrderBuilder();
    this._orderDirector = new McsOrderDirector();
    this._createWorkflowMap();
    this._subscribeAndExecuteNewOrder();
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
   * Create default order description based on order description
   * @param description Description of order details
   */
  public createDefaultOrderDescription(description: string): string {
    let currentDate = formatDate(new Date(), 'd/M/yy', CoreDefinition.LOCALE);
    return `${description} - ${currentDate}`;
  }

  /**
   * Creates or Update the order details
   * @param orderDetails The details of the order to be created
   */
  public createOrUpdateOrder(orderDetails: McsOrderCreate): void {
    this._orderBuilder
      .setDescription(orderDetails.description)
      .setContractDuration(orderDetails.contractDurationMonths)
      .setBillingSiteId(orderDetails.billingSiteId)
      .setBillingCostCentreId(orderDetails.billingCostCentreId);

    let orderItems = getSafeProperty(orderDetails, (obj) => obj.items);
    if (!isNullOrEmpty(orderItems)) {
      orderItems.forEach((item) => this._orderBuilder.addOrUpdateOrderItem(item));
    }
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
   * Submits the order workflow based on the details provided
   * @param workflow Workflow details to be submitted
   */
  public submitOrderWorkflow(workflow: McsOrderWorkflow): Observable<McsOrder> {
    let executeOrderWorkflow = this._workflowMapTable.get(workflow.state);
    if (isNullOrEmpty(executeOrderWorkflow)) {
      throw new Error(`Cannot find the associated workflow state for: ${workflow.state}`);
    }
    return executeOrderWorkflow(workflow);
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
   * Creates the order workflow table map
   */
  private _createWorkflowMap(): void {
    this._workflowMapTable.set(OrderWorkflowAction.Draft, this._draftOrder.bind(this));
    this._workflowMapTable.set(OrderWorkflowAction.Submitted, this._submitOrder.bind(this));
    this._workflowMapTable.set(OrderWorkflowAction.Cancelled, this._cancelOrder.bind(this));
    this._workflowMapTable.set(OrderWorkflowAction.Rejected, this._rejectOrder.bind(this));
    this._workflowMapTable.set(OrderWorkflowAction.AwaitingApproval,
      this._sendOrderForApproval.bind(this));
  }

  /**
   * Send the order workflow as Draft state
   * @param jobReference Job Reference to be appended on the workflow
   */
  private _draftOrder(jobReference: McsApiJobRequestBase): Observable<McsOrder> {
    return this._createOrderWorkflow(OrderWorkflowAction.Draft, jobReference);
  }

  /**
   * Send the order workflow as Submitted state
   * @param jobReference Job Reference to be appended on the workflow
   */
  private _submitOrder(jobReference: McsApiJobRequestBase): Observable<McsOrder> {
    return this._createOrderWorkflow(OrderWorkflowAction.Submitted, jobReference);
  }

  /**
   * Send the order workflow as Cancelled state
   * @param jobReference Job Reference to be appended on the workflow
   */
  private _cancelOrder(jobReference: McsApiJobRequestBase): Observable<McsOrder> {
    return this._createOrderWorkflow(OrderWorkflowAction.Cancelled, jobReference);
  }

  /**
   * Send the order workflow as Rejected state
   * @param jobReference Job Reference to be appended on the workflow
   */
  private _rejectOrder(jobReference: McsApiJobRequestBase): Observable<McsOrder> {
    return this._createOrderWorkflow(OrderWorkflowAction.Rejected, jobReference);
  }

  /**
   * Send the order workflow as for approval state
   * @param jobReference Job Reference to be appended on the workflow
   */
  private _sendOrderForApproval(jobReference: McsApiJobRequestBase): Observable<McsOrder> {
    return this._createOrderWorkflow(OrderWorkflowAction.AwaitingApproval, jobReference);
  }

  /**
   * Create the order workflow with corresponding update of the order
   * @param workflowAction Workflow action to be executed
   * @param referenceObject Reference object of the workflow response
   */
  private _createOrderWorkflow(
    workflowAction: OrderWorkflowAction,
    referenceObject: McsApiJobRequestBase
  ): Observable<McsOrder> {
    let workflowContext = {
      state: workflowAction,
      ...referenceObject
    } as McsOrderWorkflow;

    return this._orderFactory.createOrderWorkFlow(this._createdOrder.id, workflowContext).pipe(
      tap((response) => response && this.setJobs(...response.jobs)),
      catchError((httpError) => {
        this.setErrors(...httpError.errorMessages);
        return throwError(httpError);
      })
    );
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
