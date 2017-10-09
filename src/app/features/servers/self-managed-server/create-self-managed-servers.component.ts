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
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  McsApiJob,
  McsList,
  McsListItem,
  CoreDefinition,
  McsTextContentProvider,
  McsComponentService,
  McsNotificationContextService,
  McsJobType
} from '../../../core';
import {
  mergeArrays,
  addOrUpdateArrayRecord,
  refreshView
} from '../../../utilities';
import { ContextualHelpDirective } from '../../../shared';
import {
  Server,
  ServerPlatform,
  ServerOs,
  ServerResource,
  ServerCreate,
  ServerCreateStorage,
  ServerCreateNetwork,
  ServerServiceType
} from '../models';
import { CreateSelfManagedServersService } from './create-self-managed-servers.service';
import {
  CreateSelfManagedServerComponent
} from './create-self-managed-server/create-self-managed-server.component';

@Component({
  selector: 'mcs-create-self-managed-servers',
  templateUrl: './create-self-managed-servers.component.html',
  styleUrls: ['./create-self-managed-servers.component.scss']
})

export class CreateSelfManagedServersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('selfManagedServersElement')
  public selfManagedServersElement: ElementRef;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives;

  public vdcValue: any;
  public vdcList: McsList;

  public contextualTextContent: any;
  public createServerTextContent: any;

  public notifications: McsApiJob[];
  public newServers: Array<McsComponentService<CreateSelfManagedServerComponent>>;
  public isLoading: boolean;

  // Others
  private _obtainDataSubscription: any;
  private _notificationsSubscription: any;
  private _mainContextInformations: ContextualHelpDirective[];

  /**
   * Server platform data mapping
   */
  private _serverPlatformMap: Map<string, ServerResource>;
  public get serverPlatformMap(): Map<string, ServerResource> {
    return this._serverPlatformMap;
  }

  /**
   * Server list data mapping
   */
  private _serverListMap: Map<string, Server[]>;
  public get serverListMap(): Map<string, Server[]> {
    return this._serverListMap;
  }

  /**
   * Server OS list
   */
  private _serversOs: ServerOs[];
  public get serversOs(): ServerOs[] {
    return this._serversOs;
  }

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ADD_BLACK;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get hasNotifications(): boolean {
    return this.notifications && this.notifications.length > 0;
  }

  public get isServersValid(): boolean {
    let inValidExists = this.newServers.find((newServer) => {
      return !newServer.componentRef.instance.isValid;
    });
    return inValidExists ? false : true;
  }

  public constructor(
    private _createSelfManagedServices: CreateSelfManagedServersService,
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService
  ) {
    this.notifications = new Array();
    this.newServers = new Array();
    this.vdcList = new McsList();
    this.isLoading = true;

    this._mainContextInformations = new Array();
    this._serversOs = new Array();
    this._serverListMap = new Map<string, Server[]>();
    this._serverPlatformMap = new Map<string, ServerResource>();
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    // Get all the data from api in parallel
    this._obtainDataSubscription = Observable.forkJoin([
      this._createSelfManagedServices.getAllServers(),
      this._createSelfManagedServices.getPlatformData(),
      this._createSelfManagedServices.getServersOs()
    ]).subscribe((data) => {
      this._setAllServers(data[0]);
      this._setPlatformData(data[1]);
      this._setServerOs(data[2]);

      // Add server
      this._setVdcItems();
      this.isLoading = false;
      this.addServer();
    });

    // Listen to notifications
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
    if (this._obtainDataSubscription) {
      this._obtainDataSubscription.unsubscribe();
    }
    if (this._notificationsSubscription) {
      this._notificationsSubscription.unsubscribe();
    }
  }

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
    componentService.componentRef.instance.resource = this._serverPlatformMap.get(this.vdcValue);
    componentService.componentRef.instance.servers = this._serverListMap.get(this.vdcValue);
    componentService.componentRef.instance.serversOs = this.serversOs;
    componentService.appendComponentTo(this.selfManagedServersElement.nativeElement);

    // Add new server to servers list
    this.newServers.push(componentService);
  }

  public getAllContextualInformations() {
    return mergeArrays(this._mainContextInformations,
      this._createSelfManagedServices.subContextualHelp);
  }

  public onNavigateToServerPage() {
    this._router.navigate(['/servers']);
  }

  public onDeployServer() {
    // Clear notifications
    this.notifications = new Array();

    // Loop to all new servers
    this.newServers.forEach((server) => {
      let serverCreate = new ServerCreate();
      // Server Data
      serverCreate.platform = 'vcloud';
      serverCreate.resource = server.componentRef.instance.vdcName;
      serverCreate.name = server.componentRef.instance.serverName;
      serverCreate.guestOs = server.componentRef.instance.serverInputs.vTemplate;
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
    });
  }

  private _setVdcItems(): void {
    if (!this._serverPlatformMap) { return; }

    // Populate vdc list dropdown list
    this._serverPlatformMap.forEach((value, key) => {
      this.vdcList.push(this.createServerTextContent.vdcDropdownList.name,
        new McsListItem(
          key,
          this.createServerTextContent.vdcDropdownList.prefix + `${value.name}`
        ));
    });

    // Select first element of the VDC
    if (this.vdcList) {
      this.vdcValue = this.vdcList.getGroup(
        this.vdcList.getGroupNames()[0])[0].key;
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
            return job.type === McsJobType.CreateServer;
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
  private _setPlatformData(response: any): void {
    if (response && response.content) {
      let serverPlatform = response.content as ServerPlatform;
      serverPlatform.environments.forEach((environment) => {
        environment.resources.forEach((resource) => {
          if (resource.serviceType === ServerServiceType.SelfManaged) {
            this._serverPlatformMap.set(resource.name, resource);
          }
        });
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
      let serverOs = response.content as ServerOs[];

      serverOs.forEach((os) => {
        if (os.serviceType === ServerServiceType.SelfManaged) {
          this._serversOs.push(os);
        }
      });
    }
  }
}
