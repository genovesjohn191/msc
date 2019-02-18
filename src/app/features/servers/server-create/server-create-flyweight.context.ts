import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  tap,
  takeUntil,
  finalize
} from 'rxjs/operators';
import {
  McsGuid,
  McsErrorHandlerService,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  OrderIdType,
  ServiceType,
  McsJob,
  DataStatus,
  McsOrder,
  McsOrderCreate,
  McsOrderItemCreate,
  McsServerCreate,
  McsServerClone,
  McsResource,
  RouteKey,
  OrderWorkflowAction,
  McsOrderWorkflow
} from '@app/models';
import {
  McsServersRepository,
  McsOrdersRepository
} from '@app/services';

@Injectable()
export class ServerCreateFlyweightContext {
  public errorChanges = new BehaviorSubject<any>(undefined);
  public jobsChanges = new BehaviorSubject<McsJob[]>(undefined);
  public resourceChanges = new BehaviorSubject<McsResource>(undefined);
  public formArrayChanges = new BehaviorSubject<FormArray>(undefined);

  private _addedAddOns: McsOrderItemCreate[] = [];

  private _error: any;
  private _jobs: McsJob[];
  private _resource: McsResource;
  private _formArray: FormArray;
  private _updateResetRequest = new Subject<void>();

  /**
   * Returns the main order reference ID
   */
  public get orderReferenceId(): string {
    return getSafeProperty(this._order, (obj) => obj.items[0].referenceId);
  }

  /**
   * Returns the main order service ID
   */
  public get orderServiceId(): string {
    return getSafeProperty(this._order, (obj) => obj.items[0].serviceId);
  }

  /**
   * Returns the whole order details
   */
  public get order(): McsOrder { return this._order; }
  private _order: McsOrder;

  public get orderChanges(): Observable<McsOrder> { return this._orderChanges; }
  private _orderChanges = new Subject<McsOrder>();

  public get updateOrderStateChanges(): Observable<DataStatus> {
    return this._updateOrderStateChanges.pipe(distinctUntilChanged());
  }
  private _updateOrderStateChanges = new Subject<DataStatus>();

  constructor(
    private _ordersRepository: McsOrdersRepository,
    private _serversRepository: McsServersRepository,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    this._jobs = new Array();
    this._updateOrderStateChanges = new Subject<DataStatus>();
  }

  /**
   * Sets the creation form array
   * `@Note`: It can be multiple form group when using multiple creation of server
   * @param formArray Form array to be set
   */
  public setCreationFormArray(formArray: FormArray): void {
    if (this._formArray === formArray) { return; }
    this._formArray = formArray;
    this.formArrayChanges.next(this._formArray);
  }

  /**
   * Sets the resource instance to the subject
   * @param resource Resource to be set and will notify the changes made
   */
  public setResource(resource: McsResource): void {
    if (this._resource === resource) { return; }
    this._resource = resource;
    this.resourceChanges.next(this._resource);
  }

  /**
   * Sets / Add the job provided to the instance of the jobs
   * @param job Job to be added
   */
  public setJobs(...job: McsJob[]): void {
    if (isNullOrEmpty(job)) { return; }
    this._jobs = job;
    this.jobsChanges.next(this._jobs);
  }

  /**
   * Sets the error as a global
   * @ignore Do not use this as this serve as a temporary fixed for error handling
   * @param error Error to be set
   */
  public setError(error: any): void {
    if (isNullOrEmpty(error)) { return; }
    this._error = error;
    this.errorChanges.next(this._error);
  }

  public createOrderWorkflow(action: OrderWorkflowAction): Observable<McsOrder> {
    if (isNullOrEmpty(this.order)) { return; }
    let workDetails = new McsOrderWorkflow();
    workDetails.state = action;

    return this._ordersRepository.createOrderWorkflow(this.order.id, workDetails).pipe(
      tap((orderDetails) => {
        this.setJobs(...orderDetails.jobs);
      })
    );
  }

  public updateAddOns(newLineItems: McsOrderItemCreate[]): Observable<McsOrder> {
    this._updateOrderStateChanges.next(DataStatus.InProgress);

    // Send the request to API
    this._updateResetRequest.next();
    return this._ordersRepository.updateOrder(
      this._order.id,
      'Managed Server',
      12,
      newLineItems,
      this._addedAddOns
    ).pipe(
      takeUntil(this._updateResetRequest),
      catchError((error) => {
        this._updateOrderStateChanges.next(DataStatus.Error);
        return throwError(error);
      }),
      tap((response) => {
        this._updateOrderStateChanges.next(DataStatus.Success);
        this._setOrderDetails(response);
      }),
      finalize(() => this._addedAddOns = newLineItems)
    );
  }

  public createServer(
    serverModel: McsServerCreate | McsServerClone,
    serviceType: ServiceType,
    resourceName: string
  ): Observable<McsJob | McsOrder> {
    if (isNullOrEmpty(serverModel)) { return; }
    let serverInstance: Observable<McsJob | McsOrder>;

    // Create the server based on its instance
    serverModel.clientReferenceObject.resourcePath =
      CoreRoutes.getNavigationPath(RouteKey.ServerDetail);

    if (serviceType === ServiceType.SelfManaged) {
      serverInstance = serverModel instanceof McsServerCreate ?
        this._createNewSelfManageServer(serverModel) :
        this._createCloneSelfManagedServer(serverModel);
    } else {

      // Set Inview level
      (serverModel as any).inviewLevel = 'Premium';

      // Create Order item
      let orderItem = new McsOrderItemCreate();
      orderItem.itemOrderTypeId = OrderIdType.CreateManagedServer;
      orderItem.referenceId = McsGuid.newGuid().toString();
      orderItem.parentServiceId = resourceName;
      orderItem.properties = serverModel;

      // Create order
      let order = new McsOrderCreate();
      order.description = 'New Managed Server';
      order.contractDuration = 12;
      order.items = [orderItem];
      serverInstance = this._ordersRepository.createOrder(order);
    }

    this._updateOrderStateChanges.next(DataStatus.InProgress);
    return serverInstance.pipe(
      tap((response) => {
        response instanceof McsJob ?
          this.setJobs(response) :
          this._setOrderDetails(response);
        this._updateOrderStateChanges.next(DataStatus.Success);
      }),
      catchError((error) => {
        this._updateOrderStateChanges.next(DataStatus.Error);
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
  }

  /**
   * Sets the order details if changes has been made
   * @param _orderDetails Update order details to be
   */
  private _setOrderDetails(_orderDetails: McsOrder): void {
    if (isNullOrEmpty(_orderDetails)) { return undefined; }
    this._order = _orderDetails;
    this._orderChanges.next(this._order);
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewSelfManageServer(serverCreateModel: McsServerCreate): Observable<McsJob> {
    if (isNullOrEmpty(serverCreateModel)) { return; }
    return this._serversRepository.createServer(serverCreateModel);
  }

  /**
   * Clones a server based on server input
   * @param serverCloneModel Server input based on the form data
   */
  private _createCloneSelfManagedServer(serverCloneModel: McsServerClone): Observable<McsJob> {
    if (isNullOrEmpty(serverCloneModel)) { return; }
    return this._serversRepository
      .cloneServer(serverCloneModel.clientReferenceObject.serverId, serverCloneModel);
  }
}
