import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
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
import { Observable } from 'rxjs/Rx';
import {
  McsApiJob,
  CoreDefinition,
  McsTextContentProvider,
  McsComponentService,
  McsNotificationContextService,
  McsJobType,
  McsSafeToNavigateAway
} from '../../../core';
import {
  mergeArrays,
  addOrUpdateArrayRecord,
  refreshView,
  isNullOrEmpty,
  replacePlaceholder
} from '../../../utilities';
import { ContextualHelpDirective } from '../../../shared';
import {
  Server,
  ServerGroupedOs,
  ServerOs,
  ServerResource,
  ServerVApp,
  ServerCreate,
  ServerClone,
  ServerCreateStorage,
  ServerCreateNetwork,
  ServerServiceType,
  ServerCreateType
} from '../models';
import { CreateSelfManagedServersService } from './create-self-managed-servers.service';
import {
  CreateSelfManagedServerComponent
} from './create-self-managed-server/create-self-managed-server.component';

@Component({
  selector: 'mcs-create-self-managed-servers',
  templateUrl: './create-self-managed-servers.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateSelfManagedServersComponent implements
  OnInit,
  AfterViewInit,
  OnDestroy,
  McsSafeToNavigateAway {

  @ViewChild('selfManagedServersElement')
  public selfManagedServersElement: ElementRef;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives;

  public vdcValue: any;
  public vdcList: any;

  public contextualTextContent: any;
  public createServerTextContent: any;

  public notifications: McsApiJob[];
  public newServers: Array<McsComponentService<CreateSelfManagedServerComponent>>;
  public isLoading: boolean;
  public deployingServers: boolean;

  // Others
  public obtainDataSubscription: any;
  private _contextulHelpSubscription: any;
  private _notificationsSubscription: any;
  private _mainContextInformations: ContextualHelpDirective[];

  /**
   * Server resources data mapping
   */
  private _serverResourceMap: Map<string, ServerResource>;
  public get serverResourceMap(): Map<string, ServerResource> {
    return this._serverResourceMap;
  }

  /**
   * Server list data mapping
   */
  private _serverListMap: Map<string, Server[]>;
  public get serverListMap(): Map<string, Server[]> {
    return this._serverListMap;
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
    private _createSelfManagedServices: CreateSelfManagedServersService,
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.notifications = new Array();
    this.newServers = new Array();
    this.vdcList = new Array();
    this.isLoading = true;

    this._mainContextInformations = new Array();
    this._serversOs = new Array();
    this._serverListMap = new Map<string, Server[]>();
    this._serverResourceMap = new Map<string, ServerResource>();
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    // Get all the data from api in parallel
    this.obtainDataSubscription = Observable.forkJoin([
      this._createSelfManagedServices.getAllServers(),
      this._createSelfManagedServices.getResources(),
      this._createSelfManagedServices.getServersOs()
    ]).subscribe((data) => {
      this._setAllServers(data[0]);
      this._setResourcesData(data[1]);
      this._setServerOs(data[2]);

      // Add server
      this._setVdcItems();
      this.isLoading = false;
      this.addServer();
    });

    // Listen to contextual helps and notifications
    this._listenToContextualHelp();
    this._listenToNotifications();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        this._mainContextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
      }
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this.obtainDataSubscription)) {
      this.obtainDataSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._notificationsSubscription)) {
      this._notificationsSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._contextulHelpSubscription)) {
      this._contextulHelpSubscription.unsubscribe();
    }
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public safeToNavigateAway(): boolean {
    let canNavigate: boolean = true;
    for (let server of this.newServers) {
      canNavigate = !server.componentRef.instance.isTouchedAndDirty() || this.deployingServers;
      if (canNavigate) { break; }
    }
    return canNavigate;
  }

  /**
   * Add new server instance that supports multiple servers creation
   */
  public addServer(): void {
    if (!this.selfManagedServersElement) { return; }

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
    componentService.componentRef.instance.servers = this._serverListMap.get(this.vdcValue);
    componentService.componentRef.instance.serversOs = this.serversOs;
    componentService.appendComponentTo(this.selfManagedServersElement.nativeElement);

    // Add new server to servers list
    this.newServers.push(componentService);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get all the contextual helps including the child components
   */
  public getAllContextualInformations() {
    return mergeArrays(this._mainContextInformations,
      this._createSelfManagedServices.subContextualHelp);
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
        server.componentRef.instance.touchedAllControls();
        server.componentRef.instance.setFocusToInvalidElement();
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
    this.notifications = new Array();

    // Loop to all new servers
    this.newServers.forEach((server) => {
      if (server.componentRef.instance.serverInputs.type === ServerCreateType.Clone) {
        let serverId = server.componentRef.instance.serverInputs.targetServer;
        let serverClone = new ServerClone();
        serverClone.name = server.componentRef.instance.serverInputs.serverName;

        this._createSelfManagedServices.cloneServer(serverId, serverClone)
          .subscribe((response) => {
            // Subscribe to execute the creation asynchronously
            // and get the current jobs
            if (response.content) {
              this.notifications.push(response.content);
            }
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

        this._createSelfManagedServices.createServer(serverCreate)
          .subscribe((response) => {
            // Subscribe to execute the creation asynchronously
            // and get the current jobs
            if (response.content) {
              this.notifications.push(response.content);
            }
          });
      }
    });
  }

  /**
   * Set the VDC items to dropdown
   */
  private _setVdcItems(): void {
    if (!this._serverResourceMap) { return; }

    // Populate vdc list dropdown list
    this._serverResourceMap.forEach((value, key) => {
      let prefix = replacePlaceholder(
        this.createServerTextContent.vdcDropdownList.prefix,
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
   * This will listen to notifications changes in case
   * the existing notification in the provisioning is created and
   * need to update
   */
  private _listenToNotifications(): void {
    this._notificationsSubscription = this._notificationContextService
      .notificationsStream.subscribe((updatedNotifications) => {
        if (updatedNotifications) {
          let creationJobs = updatedNotifications.filter((job) => {
            return job.type === McsJobType.CreateServer || job.type === McsJobType.CloneServer;
          });

          // Update new created servers
          for (let job of creationJobs) {
            addOrUpdateArrayRecord(this.notifications, job, true,
              (_first: McsApiJob, _second: McsApiJob) => {
                return _first.id === _second.id;
              });
          }
        }
      });
  }

  /**
   * Listener to all contextual help to refresh the view since the changedetection is OnPush
   */
  private _listenToContextualHelp(): void {
    this._contextulHelpSubscription = this._createSelfManagedServices.
      subContextualHelpStream.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * This will set all the servers to the servers mapping
   * for easily access across its chidren component
   *
   * `@Note` This will execute together with the platform and os obtainment
   * @param response Api response
   */
  private _setAllServers(response: any): void {
    if (response && response.content) {
      let servers = response.content as Server[];
      servers.forEach((server) => {
        let serversRecord: Server[] = new Array();
        if (server.serviceType !== ServerServiceType.SelfManaged) { return; }
        if (this._serverListMap.has(server.vdcName)) {
          serversRecord = this._serverListMap.get(server.vdcName);
        }

        serversRecord.push(server);
        this._serverListMap.set(server.vdcName, serversRecord);
      });
    }
  }

  /**
   * This will set the Platform data to platform mapping
   * for easily access across its chidren component
   *
   * `@Note` This will execute together with the servers and os obtainment
   * @param response Api response
   */
  private _setResourcesData(response: any): void {
    if (response && response.content) {
      let serverResources = response.content as ServerResource[];
      serverResources.forEach((resource) => {
        if (resource.serviceType === ServerServiceType.SelfManaged) {
          this._serverResourceMap.set(resource.name, resource);
        }
      });
    }
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
        groupedOs.os = new Array<ServerOs>();

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
}
