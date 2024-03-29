import {
  forkJoin,
  throwError,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  ActivatedRoute,
  Params
} from '@angular/router';
import {
  CoreValidators,
  IMcsFormGroup,
  McsFormGroupService,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  OrderDetails,
  ServerManageScale
} from '@app/features-shared';
import {
  HttpStatusCode,
  McsEntityProvision,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsResource,
  McsServer,
  McsServerCompute,
  OrderIdType,
  ServiceOrderState,
  McsServersQueryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  McsFormGroupDirective
} from '@app/shared';
import {
  compareStrings,
  convertGbToMb,
  convertMbToGb,
  convertUrlParamsKeyToLowerCase,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';

import { ServerManagedScaleService } from './server-managed-scale.service';

type ScaleManageProperties = {
  cpuCount: number;
  memoryMB: number;
  restartServer: boolean;
};

const SCALE_MANAGE_SERVER_REF_ID = Guid.newGuid().toString();
const OTHERS_RESOURCE_NAME = 'Others';

@Component({
  selector: 'mcs-order-server-managed-scale',
  templateUrl: 'server-managed-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerManagedScaleService]
})

export class ServerManagedScaleComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public serverGroups$: Observable<McsOptionGroup[]>;
  public resource$: Observable<McsResource>;

  public fgServerManagedScaleDetails: FormGroup;
  public fcManageServer: FormControl<McsServer>;

  @ViewChild('fgManageScale')
  private _fgManageScale: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _manageScale: ServerManageScale;
  private _destroySubject = new Subject<void>();
  private _selectedServerHandler: Subscription;
  private _resourcesDataChangeHandler: Subscription;
  private _scaleServerOrderStateMessageMap = new Map<ServiceOrderState, string>();

  private _errorStatus: number;
  private _serverGroupCount: number;
  private _selectedServer: string;
  private _resourceId: string;

  private _serverPrimaryStorageProfileDisabled: boolean;

  public readonly inProgress$: BehaviorSubject<boolean>;

  constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _scaleManagedServerService: ServerManagedScaleService
  ) {
    super(
      _scaleManagedServerService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'scale-manage-server-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._manageScale = new ServerManageScale();
    this.inProgress$ = new BehaviorSubject<boolean>(false);
  }

  public ngOnInit() {
    this._subscribesToQueryParams();
    this._registerFormGroups();
    this._registerEvents();
    this._registerProvisionStateMap();
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedServerHandler);
    unsubscribeSafely(this._resourcesDataChangeHandler);
  }

  public setProgressState(inProgress: boolean): void {
    this.inProgress$.next(inProgress);
  }

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._serverGroupCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  /**
   * Returns the minimum memory in GB
   */
  public get minimumMemoryGB(): number {
    return convertMbToGb(getSafeProperty(this.fcManageServer.value as McsServer, (obj) => obj.compute.memoryMB, 2));
  }

  /**
   * Returns the minimum cpu count
   */
  public get minimumCpu(): number {
    return getSafeProperty(this.fcManageServer.value as McsServer, (obj) => obj.compute.cpuCount, 2);
  }

  /**
   * Returns true when all forms are valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._manageScale.hasChanged;
  }

  /**
   * Returns the compute of the selected server
   */
  public get selectedServerCompute(): McsServerCompute {
    if (isNullOrEmpty(this.fcManageServer.value)) { return; }
    let selectedServer = this.fcManageServer.value as McsServer;
    return selectedServer.compute;
  }

  /**
   * Event that emits whenever a resource is selected
   * @param server selected server
   */
  public onChangeServer(server: McsServer): void {
    if (isNullOrEmpty(server) || isNullOrEmpty(server.serviceId)) { return; }
    this._resetScaleManagedServerState();
    this._subscribeToResourceById(server.platform.resourceId);
    this._validateDisabledStorageProfile(server.platform.resourceId, server);
    this._resourceId = server.platform.resourceId;
  }

  /**
   * Check whether server's primary disk resides on a disabled storage profile
   */
  private _validateDisabledStorageProfile(resourceId: string, server: McsServer): void {
    this.setProgressState(true);
    forkJoin(
      this._apiService.getResourceStorages(resourceId).pipe(
        map((response) => getSafeProperty(response, (obj) => obj)),
        catchError((error) => {
          this.setProgressState(false);
          return throwError(error);
        })
      ),
      this._apiService.getServerStorage(server?.id).pipe(
        map((response) => getSafeProperty(response, (obj) => obj)),
        catchError((error) => {
          this.setProgressState(false);
          return throwError(error);
        })
      ),
    ).subscribe(([_resourceStorage, _serverStorage]) => {
      let _primaryDiskStorageProfileName = _serverStorage.collection.find((disk) => disk.isPrimary)?.storageProfile;
      let _matchingStorageProfile = _resourceStorage.collection.find((storageProfile) => storageProfile?.name === _primaryDiskStorageProfileName);

      this._serverPrimaryStorageProfileDisabled = isNullOrEmpty(_matchingStorageProfile)?
      false : !_matchingStorageProfile?.enabled;
      this.setProgressState(false);
    });
  }

  /**
   * Returns true when server's primary disk resides on a disabled storage profile
   */
  public get isOnDisabledStorageProfile(): boolean {
    return this._serverPrimaryStorageProfileDisabled;
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param manageScale Manage Scale content
   * @param server current server selected
   */
  public onScaleChanged(manageScale: ServerManageScale, server: McsServer): void {
    if (isNullOrEmpty(manageScale) ||
      !manageScale.hasChanged ||
      isNullOrEmpty(getSafeProperty(server, (obj) => obj.serviceId))) { return; }

    this._manageScale = manageScale;
    this._scaleManagedServerService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ScaleManageServer,
            referenceId: SCALE_MANAGE_SERVER_REF_ID,
            properties: {
              cpuCount: manageScale.cpuCount,
              memoryMB: convertGbToMb(manageScale.memoryGB),
              restartServer: !server.cpuHotPlugEnabled ? true: manageScale.restartServer
            } as ScaleManageProperties,
            serviceId: server.serviceId
          })
        ]
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the scale details is submitted
   */
  public onSubmitScaleDetails(): void {
    if (isNullOrEmpty(this._manageScale)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param submitDetails order details
   * @param managedServerId id of current server selected
   */
  public onSubmitOrder(submitDetails: OrderDetails, managedServerId: string): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serverId: managedServerId,
      serviceId: this._resourceId,
      ticketServiceId: this._resourceId
    };

    this.submitOrderWorkflow(workflow);
  }

  /**
   * Event that emits when the server confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onServerConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._scaleManagedServerService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._scaleManagedServerService.submitOrderRequest();
  }

  /**
   * Gets all the server and filters out the manage cloud server
   */
  private _subscribeToManagedCloudServers(): void {
    let queryParam = new McsServersQueryParams();
    queryParam.platformType = 'VCloud';

    this.serverGroups$ = this._apiService.getServers(queryParam).pipe(
      map((serversCollection) => {
        let serverGroups: McsOptionGroup[] = [];
        let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];
        this._setManagedServerDefaultValue(servers);
        servers.forEach((server) => {
          if (server.isSelfManaged) { return; }

          let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || OTHERS_RESOURCE_NAME;
          let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
          let serverDetails = this._createManageServerDetails(server);

          if (!isNullOrEmpty(foundGroup)) {
            foundGroup.options.push(createObject(McsOption, { text: server.name, value: serverDetails }));
            return;
          }
          serverGroups.push(
            new McsOptionGroup(platformName, createObject(McsOption, { text: server.name, value: serverDetails }))
          );
        });
        this._serverGroupCount = serverGroups?.length;
        return serverGroups;
      }),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      })
    );
  }

  private _setManagedServerDefaultValue(servers: McsServer[]): void {
    if (isNullOrEmpty(this._selectedServer)) { return; }
    let selectedServer = servers.find((server) => {
      let sameServerId = compareStrings(server.id, this._selectedServer) === 0;
      let sameServiceId = compareStrings(server.serviceId, this._selectedServer) === 0;
      return sameServerId || sameServiceId;
    })
    this.fcManageServer.setValue(selectedServer);
  }

  /**
   * Creata manage server details based on its status
   */
  private _createManageServerDetails(server: McsServer): McsEntityProvision<McsServer> {
    let serverDetails = new McsEntityProvision<McsServer>();
    serverDetails.entity = server;

    // Return immediately when server is not disable
    let isServerDisable = !server.serviceChangeAvailable || server.isProcessing;
    if (!isServerDisable) {
      serverDetails.disabled = false;
      return serverDetails;
    }

    let serverOrderState = !server.serviceChangeAvailable ? ServiceOrderState.ChangeUnavailable : ServiceOrderState.Busy;
    serverDetails.message = this._scaleServerOrderStateMessageMap.get(serverOrderState);
    serverDetails.disabled = true;
    return serverDetails;
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeToResourceById(resourceId: string): void {
    this.resource$ = this._apiService.getResource(resourceId).pipe(
      tap(() => this._changeDetectorRef.markForCheck()),
      shareReplay(1)
    );
  }

  private _subscribesToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      catchError(() => EMPTY),
      map((params: Params) => {
        let lowercaseParams: Params = convertUrlParamsKeyToLowerCase(params);
        return lowercaseParams.serverid || lowercaseParams.serviceid;
      }),
      tap((id: string) => {
        this._selectedServer = id;
    })).subscribe();
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._resourcesDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeResources, () => this._changeDetectorRef.markForCheck()
    );
  }

  /**
   * Resets the scale managed server state
   */
  private _resetScaleManagedServerState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._manageScale.hasChanged = false;
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Validates the form fields in all existing form groups
   */
  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  /**
   * Touches all the invalid form fields
   */
  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgServerManagedScaleDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fgServerManagedScaleDetails = this._formBuilder.group([]);
    this.fcManageServer = new FormControl<McsServer>(null, [CoreValidators.required]);

    this.fgServerManagedScaleDetails = new FormGroup<any>({
      fcManageServer: this.fcManageServer
    });

    if (!isNullOrEmpty(this._fgManageScale)) {
      this.fgServerManagedScaleDetails.addControl('fgManageScale',
        this._fgManageScale.getFormGroup().formGroup);
    }
  }

  /**
   * Create state message map for server details
   */
  private _registerProvisionStateMap(): void {
    this._scaleServerOrderStateMessageMap.set(
      ServiceOrderState.Busy,
      this.translateService.instant('orderServerManagedScale.vmDetails.busy')
    );

    this._scaleServerOrderStateMessageMap.set(
      ServiceOrderState.ChangeUnavailable,
      this.translateService.instant('orderServerManagedScale.vmDetails.serverChangeAvailableFalse')
    );
  }
}
