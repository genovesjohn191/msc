import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  McsApiJob,
  CoreDefinition,
  McsTextContentProvider,
  McsComponentService,
  McsSafeToNavigateAway,
  McsErrorHandlerService,
  McsOption,
  McsDataStatusFactory
} from '../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  unsubscribeSafely,
  removeAllChildren
} from '../../../../utilities';
import {
  ServerGroupedOs,
  ServerOperatingSystem,
  ServerResource,
  ServerVApp,
  ServerCreate,
  ServerClone,
  ServerCreateStorage,
  ServerCreateNetwork,
  ServerServiceType,
  ServerCreateType
} from '../../models';
import {
  CreateSelfManagedServerComponent
} from './create-self-managed-server/create-self-managed-server.component';
import { ServersService } from '../../servers.service';
import { ServersResourcesRespository } from '../../servers-resources.repository';

@Component({
  selector: 'mcs-create-self-managed-servers',
  templateUrl: './create-self-managed-servers.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class CreateSelfManagedServersComponent implements
  OnInit,
  OnDestroy,
  McsSafeToNavigateAway {

  @ViewChild('selfManagedServersElement')
  public selfManagedServersElement: ElementRef;

  public contextualTextContent: any;
  public textContent: any;
  public obtainDataSubscription: Subscription;
  public resourceSubscription: Subscription;
  public notifications: McsApiJob[];
  public newServers: Array<McsComponentService<CreateSelfManagedServerComponent>>;
  public deployingServers: boolean;
  public provisioningStatusFactory: McsDataStatusFactory<McsApiJob>;

  /**
   * VDC name selection field
   */
  public vdcList: McsOption[];
  public get vdcValue(): string { return this._vdcValue; }
  public set vdcValue(value: string) {
    if (value !== this._vdcValue) {
      this._vdcValue = value;
      this._updateResourceRecord(value);
    }
  }
  private _vdcValue: string;

  // Others
  private _resourcesSubscription: Subscription;
  private _contextulHelpSubscription: Subscription;
  private _notificationsSubscription: Subscription;

  /**
   * Server resources data mapping
   */
  private _serverResourceMap: Map<string, ServerResource>;
  public get serverResourceMap(): Map<string, ServerResource> {
    return this._serverResourceMap;
  }

  /**
   * Server VApp list
   */
  private _serverVApp: ServerVApp[];
  public get serverVApp(): ServerVApp[] {
    return this._serverVApp;
  }

  /**
   * Server OS list
   */
  private _serversOs: ServerGroupedOs[];
  public get serversOs(): ServerGroupedOs[] {
    return this._serversOs;
  }

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ADD_BLACK;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get hasResources(): boolean {
    return !isNullOrEmpty(this.serverResourceMap.size);
  }

  public get hasNotifications(): boolean {
    return this.notifications && this.notifications.length > 0;
  }

  public get isServersValid(): boolean {
    if (isNullOrEmpty(this.newServers)) { return false; }

    let inValidExists = this.newServers.find((newServer) => {
      return !newServer.componentRef.instance.isValid;
    });

    return inValidExists ? false : true;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public constructor(
    private _serversService: ServersService,
    private _serversResourceRepository: ServersResourcesRespository,
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.notifications = new Array();
    this.newServers = new Array();
    this.vdcList = new Array();
    this.provisioningStatusFactory = new McsDataStatusFactory();

    this._serversOs = new Array();
    this._serverResourceMap = new Map<string, ServerResource>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.createServer.selfManagedServer;
    this.contextualTextContent = this.textContent.contextualHelp;

    // Get all the data from api in parallel
    this.obtainDataSubscription = Observable.forkJoin([
      this._serversService.getServerOs(),
      this._serversResourceRepository.findAllRecords()
    ])
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((data) => {
        this._setServerOs(data[0]);
        this._setResourcesData(data[1]);
      });

    // Initialize all object data
    this.obtainDataSubscription.add(() => {
      this._initializeData();
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.obtainDataSubscription);
    unsubscribeSafely(this._resourcesSubscription);
    unsubscribeSafely(this._notificationsSubscription);
    unsubscribeSafely(this._contextulHelpSubscription);
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public safeToNavigateAway(): boolean {
    let canNavigate: boolean = true;
    for (let server of this.newServers) {
      canNavigate = !server.componentRef.instance.hasDirtyFormControls() || this.deployingServers;
      if (canNavigate) { break; }
    }
    return canNavigate;
  }

  /**
   * Add new server instance that supports multiple servers creation
   */
  public addServer(): void {
    if (isNullOrEmpty(this.selfManagedServersElement)) { return; }

    // Initialize new instance of component service
    let componentService: McsComponentService<CreateSelfManagedServerComponent>;
    componentService = new McsComponentService<CreateSelfManagedServerComponent>(
      CreateSelfManagedServerComponent,
      this._componentFactoryResolver,
      this._viewContainerRef,
      this._injector,
      this._renderer
    );
    componentService.createComponent();

    // Set Component Input Parameters
    componentService.componentRef.instance.vdcName = this.vdcValue;
    componentService.componentRef.instance.resource = this._serverResourceMap.get(this.vdcValue);
    componentService.componentRef.instance.serversOs = this.serversOs;
    componentService.appendComponentTo(this.selfManagedServersElement.nativeElement);

    // Add new server to servers list
    this.newServers.push(componentService);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Go to servers page
   */
  public gotoServers() {
    this._router.navigate(['/servers']);
  }

  /**
   * This will check first if all fields for the server before deployment is valid
   */
  public onPreDeployServer(_eventFunc: any): void {
    if (this.isServersValid) {
      _eventFunc();
    } else {
      // Touched all form controls
      this.newServers.forEach((server) => {
        server.componentRef.instance.validateComponentFormControls();
      });
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Deploy server when go is clicked
   */
  public onDeployServer() {
    // Clear notifications and set the deployment flag to true
    this.deployingServers = true;

    // Loop to all new servers
    this.provisioningStatusFactory.setInProgress();
    this.newServers.forEach((server) => {
      if (server.componentRef.instance.serverInputs.type === ServerCreateType.Clone) {
        let serverId = server.componentRef.instance.serverInputs.targetServer;
        let serverClone = new ServerClone();
        serverClone.name = server.componentRef.instance.serverInputs.serverName;

        this._serversService.cloneServer(serverId, serverClone)
          .catch((error) => {
            this.provisioningStatusFactory.setError();
            return Observable.throw(error);
          })
          .subscribe((response) => {
            if (isNullOrEmpty(response)) { return; }
            this.notifications.push(response.content);
            this.provisioningStatusFactory.setSuccesfull(response.content);
            this._changeDetectorRef.markForCheck();
          });
      } else {
        let serverCreate = new ServerCreate();
        // Server Data
        serverCreate.platform = 'vcloud';
        serverCreate.resource = server.componentRef.instance.vdcName;
        serverCreate.name = server.componentRef.instance.serverName;

        serverCreate.name = server.componentRef.instance.serverInputs.serverName;
        serverCreate.target = server.componentRef.instance.serverInputs.vApp;
        serverCreate.imageType = server.componentRef.instance.serverInputs.imageType;
        serverCreate.image = server.componentRef.instance.serverInputs.image;
        serverCreate.serviceId = ''; // This is only empty if the type is Self-Managed

        // Scale
        serverCreate.cpuCount = server.componentRef.instance
          .serverInputs.performanceScale.cpuCount;
        serverCreate.memoryMB = server.componentRef.instance
          .serverInputs.performanceScale.memoryMB;

        // Storage
        serverCreate.storage = new ServerCreateStorage();
        serverCreate.storage.name = server.componentRef.instance
          .serverInputs.serverManageStorage.storageProfile;
        serverCreate.storage.storageMB = server.componentRef.instance
          .serverInputs.serverManageStorage.storageMB;

        // Network
        serverCreate.network = new ServerCreateNetwork();
        serverCreate.network.name = server.componentRef.instance
          .serverInputs.networkName;
        serverCreate.network.ipAllocationMode = server.componentRef.instance
          .serverInputs.ipAddress.ipAllocationMode;
        serverCreate.network.ipAddress = server.componentRef.instance
          .serverInputs.ipAddress.customIpAddress;

        this._serversService.createServer(serverCreate)
          .catch((error) => {
            this.provisioningStatusFactory.setError();
            return Observable.throw(error);
          })
          .subscribe((response) => {
            if (isNullOrEmpty(response)) { return; }
            this.notifications.push(response.content);
            this.provisioningStatusFactory.setSuccesfull(response.content);
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }

  /**
   * Set the VDC items to dropdown
   */
  private _setVdcItems(): Promise<void> {
    if (isNullOrEmpty(this._serverResourceMap)) { return; }

    // Populate vdc list dropdown list
    this._serverResourceMap.forEach((value, key) => {
      let prefix = replacePlaceholder(
        this.textContent.vdcDropdownList.prefix,
        'availability_zone',
        value.availabilityZone
      );

      this.vdcList.push({
        value: key,
        text: `${prefix} ${value.name}`
      });
    });

    // Select first element of the VDC
    if (!isNullOrEmpty(this.vdcList)) {
      this.vdcValue = this.vdcList[0].value;
    }
  }

  /**
   * This will set the Platform data to platform mapping
   * for easily access across its chidren component
   *
   */
  private _setResourcesData(response: any): void {
    if (isNullOrEmpty(response)) { return; }
    let resources = response as ServerResource[];
    resources.forEach((resource) => {
      if (resource.serviceType === ServerServiceType.SelfManaged) {
        this._serverResourceMap.set(resource.name, resource);
      }
    });
  }

  /**
   * This will set the OS data to OS mapping
   * for easily access across its chidren component
   *
   * `@Note` This will execute together with the servers and platform obtainment
   * @param response Api response
   */
  private _setServerOs(response: any): void {
    if (response && response.content) {
      let serverOs = response.content as ServerGroupedOs[];
      let serverGroupedOs = new Array<ServerGroupedOs>();

      serverOs.forEach((group) => {
        let groupedOs = new ServerGroupedOs();
        groupedOs.platform = group.platform;
        groupedOs.os = new Array<ServerOperatingSystem>();

        group.os.forEach((os) => {
          if (os.serviceType === ServerServiceType.SelfManaged) {
            groupedOs.os.push(os);
          }
        });

        if (groupedOs.os.length > 0) {
          serverGroupedOs.push(groupedOs);
        }
      });

      this._serversOs = serverGroupedOs;
    }
  }

  /**
   * Initializes the data and set the corresponding vdc/resource
   */
  private _initializeData(): void {
    this._setVdcItems();
  }

  /**
   * Updates the resource record in the repository based on the resource id
   * @param resourceName Resource name to be updated
   */
  private _updateResourceRecord(resourceName: string): void {
    if (isNullOrEmpty(resourceName)) { return; }
    this.resourceSubscription = this._serversResourceRepository
      .findRecordById(this._serverResourceMap.get(resourceName).id)
      .finally(() => {
        removeAllChildren(this.selfManagedServersElement.nativeElement);
        this.addServer();
      })
      .subscribe((updatedResource) => {
        // Subscribe to get the updated record of the resource and
        // automatically reflect the changes to repository cache
        this._serverResourceMap.set(updatedResource.name, updatedResource);
      });
  }
}
