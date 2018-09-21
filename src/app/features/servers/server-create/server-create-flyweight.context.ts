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
  map,
  tap
} from 'rxjs/operators';
import {
  McsGuid,
  McsErrorHandlerService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  OrderIdType,
  ServiceType,
  McsJob,
  McsDataStatus,
  McsOrder,
  McsOrderUpdate,
  McsOrderItemUpdate,
  McsOrderCreate,
  McsOrderItemCreate,
  McsServerCreate,
  McsServerClone,
  McsResource
} from '@app/models';
import { OrdersService } from '@app/features/orders';
import { ServersService } from '../servers.service';

@Injectable()
export class ServerCreateFlyweightContext {
  public errorChanges = new BehaviorSubject<any>(undefined);
  public jobsChanges = new BehaviorSubject<McsJob[]>(undefined);
  public resourceChanges = new BehaviorSubject<McsResource>(undefined);
  public formArrayChanges = new BehaviorSubject<FormArray>(undefined);

  private _error: any;
  private _jobs: McsJob[];
  private _resource: McsResource;
  private _formArray: FormArray;

  /**
   * Returns the current order details
   */
  public get order(): McsOrder { return this._order; }
  private _order: McsOrder;

  public get orderChange(): Observable<McsOrder> {
    return this._orderChange.pipe(distinctUntilChanged());
  }
  private _orderChange: Subject<McsOrder>;

  public get requestStatusChange(): Observable<McsDataStatus> {
    return this._requestStatusChange.pipe(distinctUntilChanged());
  }
  private _requestStatusChange: Subject<McsDataStatus>;

  constructor(
    private _ordersService: OrdersService,
    private _serversService: ServersService,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    this._jobs = new Array();
    this._requestStatusChange = new Subject<McsDataStatus>();
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
  public setJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._jobs.push(job);
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

  /**
   * Updates the inputted order based on its item list
   * @param _updatedOrder Updated order to be requested
   */
  public updateOrder(_updatedOrder: McsOrder): void {
    if (isNullOrEmpty(_updatedOrder)) { return; }

    let targetOrder = new McsOrderUpdate();

    /* TODO: 09112018
       1. Set based on requirements
       2. Confirm if error encountered, what will happen?
       3. Need to check whether the line items have been changed so
       that we will update the order based on the line items
    */

    _updatedOrder.items.forEach((updatedItem) => {
      let targetItem = new McsOrderItemUpdate();
      targetItem.parentReferenceId = updatedItem.parentReferenceId;
      targetItem.parentServiceId = updatedItem.serviceId;
      targetItem.productOrderType = updatedItem.typeId;
      targetItem.properties = updatedItem.properties;
      targetItem.referenceId = updatedItem.referenceId;
      targetOrder.items.push(targetItem);
    });
    targetOrder.description = _updatedOrder.description;
    targetOrder.contractDuration = 2;

    this._requestStatusChange.next(McsDataStatus.InProgress);
    this._ordersService.updateOrder(_updatedOrder.id, targetOrder)
      .pipe(
        catchError((error) => {
          this._requestStatusChange.next(McsDataStatus.Error);
          return throwError(error);
        })
      )
      .subscribe((responseOrder) => {
        this._requestStatusChange.next(McsDataStatus.Success);
        this._setOrderDetails(getSafeProperty(responseOrder, (obj) => obj.content));
      });
  }

  public createServer(
    serverModel: McsServerCreate | McsServerClone,
    serviceType: ServiceType,
    resourceName: string
  ): Observable<McsJob | McsOrder> {
    if (isNullOrEmpty(serverModel)) { return; }
    let serverInstance: Observable<McsJob | McsOrder>;

    if (serviceType === ServiceType.SelfManaged) {

      // Create the server based on its intance
      serverInstance = serverModel instanceof McsServerCreate ?
        this._createNewSelfManageServer(serverModel) :
        this._createCloneSelfManagedServer(serverModel);
    } else {

      // Create Order item
      let orderItem = new McsOrderItemCreate();
      orderItem.productOrderType = OrderIdType.CreateManagedServer;
      orderItem.referenceId = McsGuid.newGuid().toString();
      orderItem.parentServiceId = resourceName;
      orderItem.properties = serverModel;

      // Create order
      let order = new McsOrderCreate();
      order.description = 'Create Managed Server';
      order.contractDuration = 12;
      order.items = [orderItem];
      serverInstance = this._ordersService.createOrder(order)
        .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
    }

    this._requestStatusChange.next(McsDataStatus.InProgress);
    return serverInstance.pipe(
      tap((response) => {
        response instanceof McsJob ?
          this.setJob(response) :
          this._setOrderDetails(response);
        this._requestStatusChange.next(McsDataStatus.Success);
      }),
      catchError((error) => {
        this._requestStatusChange.next(McsDataStatus.Error);
        this._errorHandlerService.handleHttpRedirectionError(error.status);
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
    this._orderChange.next(_orderDetails);
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewSelfManageServer(serverCreateModel: McsServerCreate): Observable<McsJob> {
    if (isNullOrEmpty(serverCreateModel)) { return; }
    return this._serversService.createServer(serverCreateModel)
      .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
  }

  /**
   * Clones a server based on server input
   * @param serverCloneModel Server input based on the form data
   */
  private _createCloneSelfManagedServer(serverCloneModel: McsServerClone): Observable<McsJob> {
    if (isNullOrEmpty(serverCloneModel)) { return; }
    return this._serversService
      .cloneServer(serverCloneModel.clientReferenceObject.serverId, serverCloneModel)
      .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
  }
}
