import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
  AfterViewInit
} from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subscription,
  Subject
} from 'rxjs/Rx';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { startWith } from 'rxjs/operators/startWith';
import {
  CoreDefinition,
  McsSafeToNavigateAway,
  McsTextContentProvider,
  McsErrorHandlerService,
  McsFormGroupService,
  McsAccessControlService,
  McsApiJob,
  McsDataStatusFactory,
  McsApiErrorResponse,
  McsDataStatus
} from '../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  unsubscribeSafely,
  clearArrayRecord
} from '../../../utilities';
import {
  ServerServiceType,
  serverServiceTypeText,
  ServerResource,
  ServerCreateType,
  ServerCreateDetails,
  ServerClone,
  ServerCreate,
  ServerCreateStorage,
  ServerCreateNetwork,
  serverPlatformTypeText
} from '../models';
import { ServersService } from '../servers.service';
import { ServersResourcesRepository } from '../servers-resources.repository';
import { CreateServerBase } from './create-server.base';

@Component({
  selector: 'mcs-create-server',
  templateUrl: 'create-server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateServerComponent implements
  OnInit, OnDestroy, AfterViewInit, McsSafeToNavigateAway {

  public textContent: any;
  public textHelpContent: any;
  public serverDeploying: boolean;
  public serverComponents: CreateServerBase[];
  public notifications: McsApiJob[];
  public faCreationForms: FormArray;
  public paramSubscription: Subscription;
  public resourcesSubscription: Subscription;
  public resourceSubscription: Subscription;
  public selectedResource: ServerResource;
  public selectedTabIndex: ServerCreateType = ServerCreateType.New;
  public dataStatusFactory: McsDataStatusFactory<McsApiJob>;
  public errorResponse: McsApiErrorResponse;

  @ViewChildren('serverBase')
  private _createServerItems: QueryList<CreateServerBase>;
  private _destroySubject = new Subject<void>();
  private _createServerMap = new Map<ServerCreateType, (input) => Observable<McsApiJob>>();

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public get resources(): ServerResource[] {
    return this._serversResourceRepository.dataRecords;
  }

  public get serviceTypeEnum() {
    return ServerServiceType;
  }

  public get serverCreateTypeEnum() {
    return ServerCreateType;
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _formGroupService: McsFormGroupService,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _accessControlService: McsAccessControlService,
    private _serversService: ServersService,
    private _serversResourceRepository: ServersResourcesRepository
  ) {
    this.faCreationForms = new FormArray([]);
    this.notifications = new Array();
    this.serverComponents = new Array();
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer;
    this.textHelpContent = this._textContentProvider.content.servers.createServer.contextualHelp;
    this._registerServerMap();
    this._getAllResources();
    this._setInitialTabViewByParam();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.resourcesSubscription);
    unsubscribeSafely(this.resourceSubscription);
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public ngAfterViewInit() {
    this._createServerItems.changes.pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        if (!isNullOrEmpty(this._createServerItems)) {
          clearArrayRecord(this.faCreationForms.controls);
          this._createServerItems.forEach((creationDetails) => {
            this.faCreationForms.push(creationDetails.getCreationForm());
          });
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Navigate to servers listing page
   */
  public gotoServers() {
    this._router.navigate(['/servers']);
  }

  /**
   * Returns true when corresponding resource has access to feature
   */
  public resourceHasAccess(resource: ServerResource): boolean {
    if (resource.serviceType === ServerServiceType.SelfManaged) { return true; }
    let allowedManagedServer = this._accessControlService
      .hasAccessToFeature('enableCreateManagedServer');
    return resource.serviceType === ServerServiceType.Managed && allowedManagedServer;
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
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(_resource: ServerResource): void {
    let resourceHasNotChanged = this.selectedResource === _resource;
    if (resourceHasNotChanged) { return; }
    // We need to clear the server components instance here
    // in order to generate new component in the DOM and refresh everything
    clearArrayRecord(this.serverComponents);
    this._getResourceById(_resource.id);
  }

  /**
   * Returns the resource displayed text based on resource data
   * @param resource Resource to be displayed
   */
  public getResourceDisplayedText(resource: ServerResource): string {
    let prefix = replacePlaceholder(
      this.textContent.vdcDropdownList.prefix,
      ['service_type', 'availability_zone'],
      [serverServiceTypeText[resource.serviceType], resource.availabilityZone]
    );
    return `${prefix} ${resource.name}`;
  }

  /**
   * Validates the form fields in all existing form groups
   */
  public validateFormFields(): void {
    let formsAreValid = !isNullOrEmpty(this.faCreationForms) && this.faCreationForms.valid;
    if (formsAreValid) { return; }
    this._formGroupService.touchAllFieldsByFormArray(this.faCreationForms);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Create server based on server details
   */
  public createServer(): void {
    if (isNullOrEmpty(this._createServerItems)) { return; }
    this.serverDeploying = true;
    this._createServerItems.forEach((serverDetails) => {
      let createInstance = this._createServerMap.get(serverDetails.creationType);

      if (!isNullOrEmpty(createInstance)) {
        createInstance(serverDetails.getCreationInputs())
          .catch((response) => {
            this.dataStatusFactory.setError();
            this.errorResponse = response.error;
            this._changeDetectorRef.markForCheck();
            return Observable.throw(response);
          })
          .subscribe((job) => {
            if (isNullOrEmpty(job)) { return; }
            this.dataStatusFactory.setSuccesfull(job);
            this.notifications.push(job);
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewServer(serverInput: ServerCreateDetails): Observable<McsApiJob> {
    if (isNullOrEmpty(serverInput)) { return; }
    let serverCreate = new ServerCreate();
    // Server Data
    serverCreate.platform = serverPlatformTypeText[this.selectedResource.platform];
    serverCreate.resource = this.selectedResource.name;
    serverCreate.name = serverInput.serverName;
    serverCreate.target = serverInput.vApp.name;
    serverCreate.imageType = serverInput.imageType;
    serverCreate.image = serverInput.image;
    serverCreate.serviceId = ''; // TODO: This is only empty if the type is Self-Managed
    // Scale
    serverCreate.cpuCount = serverInput.serverScale.cpuCount;
    serverCreate.memoryMB = serverInput.serverScale.memoryMB;
    // Storage
    serverCreate.storage = new ServerCreateStorage();
    serverCreate.storage.name = serverInput.serverManageStorage.storage.name;
    serverCreate.storage.storageMB = serverInput.serverManageStorage.storageMB;
    // Network
    serverCreate.network = new ServerCreateNetwork();
    serverCreate.network.name = serverInput.serverNetwork.network.name;
    serverCreate.network.ipAllocationMode = serverInput.serverNetwork.ipAllocationMode;
    serverCreate.network.ipAddress = serverInput.serverNetwork.customIpAddress;

    return this._serversService.createServer(serverCreate).map((response) => {
      return isNullOrEmpty(response) ? undefined : response.content;
    });
  }

  /**
   * Clones a server based on server input
   * @param serverInput Server input based on the form data
   */
  private _cloneNewServer(serverInput: ServerCreateDetails): Observable<McsApiJob> {
    if (isNullOrEmpty(serverInput)) { return; }
    let serverClone = new ServerClone();
    serverClone.name = serverInput.serverName;

    return this._serversService.cloneServer(serverInput.targetServer.id, serverClone)
      .map((response) => {
        return isNullOrEmpty(response) ? undefined : response.content;
      });
  }

  /**
   * Gets the list of resources from repository
   */
  private _getAllResources(): void {
    this.resourcesSubscription = this._serversResourceRepository
      .findAllRecords()
      .catch((error) => {
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe(() => {
        if (isNullOrEmpty(this.resources)) { return; }
        // Select the first element of the resource
        this._selectTheFirstValidResource(this.resources);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Selects the first valid resource based on their access control
   */
  private _selectTheFirstValidResource(resources: ServerResource[]): void {
    if (isNullOrEmpty(resources)) { return; }
    let validResource = resources.find((resource) => this.resourceHasAccess(resource));
    if (!isNullOrEmpty(validResource)) {
      this.onChangeResource(validResource);
    }
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _getResourceById(resourceId: any): void {
    this.resourceSubscription = this._serversResourceRepository
      .findRecordById(resourceId)
      .subscribe((updatedResource) => {
        if (isNullOrEmpty(updatedResource)) { return; }
        this.selectedResource = updatedResource;
        this.serverComponents.push(undefined);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Sets the initial tab view based on the parameter provided
   */
  private _setInitialTabViewByParam(): void {
    this.paramSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        let serverId = params['clone'];
        if (!isNullOrEmpty(serverId)) {
          this.selectedTabIndex = ServerCreateType.Clone;
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * Registers the server map
   */
  private _registerServerMap(): void {
    this._createServerMap.set(ServerCreateType.New, this._createNewServer.bind(this));
    this._createServerMap.set(ServerCreateType.Clone, this._cloneNewServer.bind(this));
  }
}
