import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
  throwError,
  Subscription
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  map
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsSafeToNavigateAway,
  McsFormGroupService,
  McsApiJob,
  McsGuid,
  McsErrorHandlerService
} from '../../../../core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  clearArrayRecord,
  getSafeProperty
} from '../../../../utilities';
import {
  Resource,
  ResourceServiceType
} from '../../../resources';
import {
  ServerCreateType,
  ServerCreateDetails,
  ServerCreate,
  ServerCreateStorage,
  ServerCreateNic,
  ServerClone,
  ServerClientObject
} from '../../models';
import {
  Order,
  OrderCreate,
  OrderIdType,
  OrderItemCreate,
  OrdersService
} from '../../../orders';
import { WizardStepNextDirective } from '../../../../shared';
import { ServersService } from '../../servers.service';
import { ServerCreateService } from '../server-create.service';
import { ServerCreateDetailsBase } from './server-create-details.base';

@Component({
  selector: 'mcs-server-create-details',
  templateUrl: 'server-create-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerCreateDetailsComponent implements
  OnInit, AfterViewInit, OnDestroy, McsSafeToNavigateAway {
  public textContent: any;
  public textHelpContent: any;

  public faCreationForms: FormArray;
  public selectedTabIndex: ServerCreateType = ServerCreateType.New;
  public serverDeploying: boolean;
  public serverComponents: ServerCreateDetailsBase[];
  public creationSubscription: Subscription;

  /**
   * Returns the current selected resource
   */
  public get resource(): Resource { return this._resource; }
  public set resource(value: Resource) { this._resource = value; }
  private _resource: Resource;

  @ViewChildren(WizardStepNextDirective)
  private _wizardNextStep: WizardStepNextDirective;

  @ViewChildren('serverBase')
  private _createServerItems: QueryList<ServerCreateDetailsBase>;
  private _destroySubject = new Subject<void>();
  private _createServerMap = new Map<ServerCreateType, (input) => Observable<McsApiJob | Order>>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
    private _createServerService: ServerCreateService,
    private _serversService: ServersService,
    private _ordersService: OrdersService
  ) {
    this.faCreationForms = new FormArray([]);
    this.serverComponents = new Array();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._listenToResourceChanges();
    this._registerServerMap();
    this._setInitialTabViewByParam();
  }

  public ngAfterViewInit() {
    this._createServerItems.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        if (!isNullOrEmpty(this._createServerItems)) {
          this.faCreationForms = new FormArray([]);
          this._createServerItems.forEach((creationDetails) => {
            this.faCreationForms.push(creationDetails.getCreationForm());
          });
        }
        this._createServerService.setCreationFormArray(this.faCreationForms);
        this._changeDetectorRef.markForCheck();
      });
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the the create type enum
   */
  public get serverCreateTypeEnum(): any {
    return ServerCreateType;
  }

  /**
   * Event that emits when navigating away from create server page to other route
   */
  public safeToNavigateAway(): boolean {
    if (isNullOrEmpty(this._createServerItems) || this.serverDeploying) { return true; }
    let dirtyForm = this._createServerItems
      .find((serverItem) => serverItem.getCreationForm().dirty);
    return isNullOrEmpty(dirtyForm);
  }

  /**
   * Event that emits wen tab changed
   * @param _tabItem Emitted tab item
   */
  public onTabChanged(_tabItem) {
    if (isNullOrEmpty(_tabItem)) { return; }
    this.selectedTabIndex = _tabItem.id;
  }

  /**
   * Validates the form fields in all existing form groups
   */
  public validateFormFields(): boolean {
    let formsAreValid = !isNullOrEmpty(this.faCreationForms) && this.faCreationForms.valid;
    if (formsAreValid) { return true; }
    this._formGroupService.touchAllFieldsByFormArray(this.faCreationForms);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
    return false;
  }

  /**
   * Create server based on server details
   */
  public createServer(): void {
    if (!this.validateFormFields()) { return; }

    if (isNullOrEmpty(this._createServerItems)) { return; }
    this.serverDeploying = true;
    this._createServerItems.forEach((serverDetails) => {
      let createInstance = this._createServerMap.get(serverDetails.getCreationType());

      if (!isNullOrEmpty(createInstance)) {
        this.creationSubscription = createInstance(serverDetails.getCreationInputs())
          .pipe(
            catchError((error) => {
              // TODO: Need to think on how to handler error in case of the final creation
              // including /submit order
              this._errorHandlerService.handleHttpRedirectionError(error.status);
              return throwError(error);
            })
          )
          .subscribe((response) => {
            if (isNullOrEmpty(response)) { return; }
            response instanceof McsApiJob ?
              this._createServerService.setJob(response) :
              this._createServerService.setOrderDetails(response);
            this._proceedToNextStep();
          });
      }
    });
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewServer(serverInput: ServerCreateDetails): Observable<McsApiJob | Order> {
    if (isNullOrEmpty(serverInput)) { return; }
    let createInstance: Observable<McsApiJob | Order>;
    let serverCreate = new ServerCreate();
    // Server Data
    serverCreate.platform = this.resource.platformLabel;
    serverCreate.resource = this.resource.name;
    serverCreate.name = serverInput.serverName;
    serverCreate.target = serverInput.vApp.name;
    serverCreate.imageType = serverInput.imageType;
    serverCreate.image = serverInput.image;
    // Scale
    serverCreate.cpuCount = serverInput.serverScale.cpuCount;
    serverCreate.memoryMB = serverInput.serverScale.memoryMB;
    // Storage
    serverCreate.storage = new ServerCreateStorage();
    serverCreate.storage.name = serverInput.serverManageStorage.storage.name;
    serverCreate.storage.sizeMB = serverInput.serverManageStorage.sizeMB;
    // Network
    serverCreate.network = new ServerCreateNic();
    serverCreate.network.name = serverInput.serverNetwork.network.name;
    serverCreate.network.ipAllocationMode = serverInput.serverNetwork.ipAllocationMode;
    serverCreate.network.ipAddress = serverInput.serverNetwork.customIpAddress;

    // TODO: Add mapping of object for ordering fields
    if (this.resource.serviceType === ResourceServiceType.Managed) {
      // Create Order item
      let orderItem = new OrderItemCreate();
      orderItem.productOrderType = OrderIdType.CreateManagedServer;
      orderItem.referenceId = McsGuid.newGuid().toString();
      orderItem.parentServiceId = this.resource.name;
      orderItem.properties = serverCreate;

      // Create order
      let order = new OrderCreate();
      order.description = 'Create Managed Server';
      order.contractDuration = 12;
      order.items = [orderItem];
      createInstance = this._ordersService.createOrder(order)
        .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
    } else {

      // Self managed VM's doesn't have resource name
      createInstance = this._serversService.createServer(serverCreate)
        .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
    }
    return createInstance;
  }

  /**
   * Clones a server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createCloneServer(serverInput: ServerCreateDetails): Observable<McsApiJob | Order> {
    if (isNullOrEmpty(serverInput)) { return; }
    let createInstance: Observable<McsApiJob | Order>;
    let serverClone = new ServerClone();
    serverClone.name = serverInput.serverName;
    serverClone.clientReferenceObject = new ServerClientObject();
    serverClone.clientReferenceObject.serverId = serverInput.targetServer.id;

    // TODO: Add mapping of object for ordering fields
    if (this.resource.serviceType === ResourceServiceType.Managed) {
      // Create order item
      let orderItem = new OrderItemCreate();
      orderItem.productOrderType = OrderIdType.CreateManagedServer;
      orderItem.referenceId = McsGuid.newGuid().toString();
      orderItem.parentServiceId = this.resource.name;
      orderItem.properties = serverClone;

      // Create order
      let order = new OrderCreate();
      order.description = 'Create Managed Server';
      order.contractDuration = 12;
      order.items = [orderItem];
      createInstance = this._ordersService.createOrder(order)
        .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
    } else {

      createInstance = this._serversService.cloneServer(serverInput.targetServer.id, serverClone)
        .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
    }
    return createInstance;
  }

  /**
   * Registers the server map
   */
  private _registerServerMap(): void {
    this._createServerMap.set(ServerCreateType.New, this._createNewServer.bind(this));
    this._createServerMap.set(ServerCreateType.Clone, this._createCloneServer.bind(this));
  }

  /**
   * Listens to resource changes
   */
  private _listenToResourceChanges(): void {
    this._createServerService.resourceChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((updatedResource) => {
        // Clear the record in order to get a new instance of the base component
        clearArrayRecord(this.serverComponents);
        this.resource = updatedResource;

        this.serverComponents.push({} as ServerCreateDetailsBase);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Sets the initial tab view based on the parameter provided
   */
  private _setInitialTabViewByParam(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params: ParamMap) => {
        let serverId = params['clone'];
        if (!isNullOrEmpty(serverId)) {
          this.selectedTabIndex = ServerCreateType.Clone;
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * Proceeds to next step
   */
  private _proceedToNextStep(): void {
    if (isNullOrEmpty(this._wizardNextStep)) { return; }
    // TODO: Uncomment for ordering
    // this._wizardNextStep.next();
  }
}
