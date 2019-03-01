import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  McsGuid,
  McsErrorHandlerService,
  CoreRoutes,
  McsOrderCoreBase
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  OrderIdType,
  ServiceType,
  McsJob,
  DataStatus,
  McsServerCreate,
  McsServerClone,
  McsResource,
  RouteKey
} from '@app/models';
import {
  McsServersRepository,
  McsOrdersRepository
} from '@app/services';

@Injectable()
export class ServerCreateFlyweightContext extends McsOrderCoreBase {
  public errorChanges = new BehaviorSubject<any>(undefined);
  public jobsChanges = new BehaviorSubject<McsJob[]>(undefined);
  public resourceChanges = new BehaviorSubject<McsResource>(undefined);
  public formArrayChanges = new BehaviorSubject<FormArray>(undefined);

  private _resource: McsResource;
  private _formArray: FormArray;

  public get updateOrderStateChanges(): Observable<DataStatus> {
    return this._updateOrderStateChanges.pipe(distinctUntilChanged());
  }
  private _updateOrderStateChanges = new Subject<DataStatus>();

  // Server builder pattern
  // private _serverBuilder: McsServerBuilder;

  constructor(
    _ordersRepository: McsOrdersRepository,
    private _serversRepository: McsServersRepository,
    _errorHandlerService: McsErrorHandlerService
  ) {
    super(_ordersRepository);
    // this._jobs = new Array();
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
   * Sets the error as a global
   * @ignore Do not use this as this serve as a temporary fixed for error handling
   * @param error Error to be set
   */
  // public setError(error: any): void {
  //   if (isNullOrEmpty(error)) { return; }
  //   this._error = error;
  //   this.errorChanges.next(this._error);
  // }

  // public createOrderWorkflow(action: OrderWorkflowAction): Observable<McsOrder> {
  //   if (isNullOrEmpty(this._createdOrder)) { return; }
  //   let workDetails = new McsOrderWorkflow();
  //   workDetails.state = action;

  //   return this._ordersRepository.createOrderWorkflow(this._createdOrder.id, workDetails).pipe(
  //     tap((orderDetails) => this._setJobs(...orderDetails.jobs))
  //   );
  // }

  // public updateAddOns(newLineItems: McsOrderItemCreate[]): Observable<McsOrder> {
  //   this._updateOrderStateChanges.next(DataStatus.InProgress);

  //   // Send the request to API
  //   this._updateResetRequest.next();
  //   return this._ordersRepository.updateOrder(
  //     this._order.id,
  //     'Managed Server',
  //     12,
  //     newLineItems,
  //     this._addedAddOns
  //   ).pipe(
  //     takeUntil(this._updateResetRequest),
  //     catchError((error) => {
  //       this._updateOrderStateChanges.next(DataStatus.Error);
  //       return throwError(error);
  //     }),
  //     tap((response) => {
  //       this._updateOrderStateChanges.next(DataStatus.Success);
  //       this._setOrderDetails(response);
  //     }),
  //     finalize(() => this._addedAddOns = newLineItems)
  //   );
  // }

  public createServer(
    serverModel: McsServerCreate | McsServerClone,
    serviceType: ServiceType,
    resourceName: string
  ): void {
    if (isNullOrEmpty(serverModel)) { return; }
    // let serverInstance: Observable<McsJob | McsOrder>;

    // Create the server based on its instance
    serverModel.clientReferenceObject.resourcePath =
      CoreRoutes.getNavigationPath(RouteKey.ServerDetail);

    if (serviceType === ServiceType.SelfManaged) {

      // Set Server Network
      // Set Server Storage
      // Set Server State
      // Build Server Create
      let serverInstance = serverModel instanceof McsServerCreate ?
        this._createNewSelfManageServer(serverModel) :
        this._createCloneSelfManagedServer(serverModel);

      serverInstance.subscribe();
    } else {

      // Set Inview level
      // TODO: We need to add this in UI
      (serverModel as any).inviewLevel = 'Premium';

      // Create Order item
      // let orderItem = new McsOrderItemCreate();
      // orderItem.itemOrderTypeId = OrderIdType.CreateManagedServer;
      // orderItem.referenceId = McsGuid.newGuid().toString();
      // orderItem.parentServiceId = resourceName;
      // orderItem.properties = serverModel;

      // Create order
      // let order = new McsOrderCreate();
      // order.description = 'New Managed Server';
      // order.contractDuration = 12;
      // order.items = [orderItem];

      // TODO: Need to get this on the type
      // this.orderBuilder
      //   .setDescription('New Managed Server')
      //   .setContractDuration(12)
      //   .addOrUpdateOrderItem({
      //     itemOrderTypeId: OrderIdType.CreateManagedServer,
      //     referenceId: McsGuid.newGuid().toString(),
      //     parentServiceId: resourceName,
      //     properties: serverModel
      //   });
      // this.orderDirector.construct(this.orderBuilder);

      this.createOrUpdateOrder({
        description: 'New Managed Server',
        contractDuration: 12,
        items: [{
          itemOrderTypeId: OrderIdType.CreateManagedServer,
          referenceId: McsGuid.newGuid().toString(),
          parentServiceId: resourceName,
          properties: serverModel
        }]
      });

      // let orderCreateRequest = this._ordersRepository.createOrder(orderDetails).pipe(
      //   tap((respose) => {

      //   })
      // );
      // orderCreateRequest.subscribe();
    }

    // this._updateOrderStateChanges.next(DataStatus.InProgress);
    // return serverInstance.pipe(
    //   tap((response) => {
    //     response instanceof McsJob ?
    //       this._setJobs(response) :
    //       this._setOrderDetails(response);
    //     this._updateOrderStateChanges.next(DataStatus.Success);
    //   }),
    //   catchError((error) => {
    //     this._updateOrderStateChanges.next(DataStatus.Error);
    //     this._errorHandlerService.redirectToErrorPage(error.status);
    //     return throwError(error);
    //   })
    // );
  }

  // protected createOrderWorkFlow
  //   (orderId: string, workFlow: McsOrderWorkflow): Observable<McsOrder> {
  //   return this._ordersRepository.createOrderWorkflow(orderId, workFlow).pipe(
  //     tap((orderDetails) => this._setJobs(...orderDetails.jobs))
  //   );
  // }

  // private _subscribeToDirectors(): void {
  //   // Check if the server creation for self-managed can be included here

  //   this._orderDirector.orderChange().pipe(
  //     takeUntil(this._destroySubject)
  //   ).subscribe((orderCreateDetails) => {
  //     // Send request the order to API
  //     // Notify Pricing Calculator for state change

  //     // Create or Update the order
  //   });
  // }

  /**
   * Sets the order details if changes has been made
   * @param _orderDetails Update order details to be
   */
  // private _setOrderDetails(_orderDetails: McsOrder): void {
  //   if (isNullOrEmpty(_orderDetails)) { return undefined; }
  //   this._createdOrder = _orderDetails;
  //   // this._orderChanges.next(this._order);
  // }

  /**
   * Sets / Add the job provided to the instance of the jobs
   * @param job Job to be added
   */
  // private _setJobs(...job: McsJob[]): void {
  //   if (isNullOrEmpty(job)) { return; }
  //   this._jobs = job;
  //   this.jobsChanges.next(this._jobs);
  // }

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
