import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  Server,
  ServerCommand,
  ServerPlatform
} from '../models';
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent,
  SuspendServerDialogComponent,
  ResumeServerDialogComponent
} from '../shared';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch,
  McsDialogService,
  McsRoutingTabBase,
  McsErrorHandlerService,
  McsDataStatusFactory,
  CoreRoutes,
  McsRouteKey
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView,
  getSafeProperty,
  unsubscribeSafely,
  unsubscribeSubject
} from '../../../utilities';
import { ComponentHandlerDirective } from '../../../shared';
import { ServersRepository } from '../servers.repository';
import { ServersService } from '../servers.service';
import { ServerService } from './server.service';
import { ServersListSource } from '../servers.listsource';

// Constant Definition
const SERVER_LIST_GROUP_OTHERS = 'Others';

// Add another group type in here if you have addition tab
type tabGroupType = 'management' | 'storage';

@Component({
  selector: 'mcs-server',
  templateUrl: './server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class ServerComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild(ComponentHandlerDirective)
  public componentHandler: ComponentHandlerDirective;

  public textContent: any;
  public serversMap: Map<string, Server[]>;
  public selectedGroupName: string;
  public selectedServer: Server;
  public selectedServerName: string;
  public serversTextContent: any;
  public serverListSource: ServersListSource | null;
  public serverSubscription: Subscription;
  public serversSubscription: Subscription;
  public listStatusFactory: McsDataStatusFactory<Map<string, Server[]>>;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  private _destroySubject = new Subject<void>();
  private _resourcesKeyMap: Map<string, ServerPlatform>;

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService,
    private _serversRepository: ServersRepository,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    super(_router, _activatedRoute);
    this._resourcesKeyMap = new Map();
    this.selectedServer = new Server();
    this.serversMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.serversTextContent = this._textContentProvider.content.servers;
    this.textContent = this._textContentProvider.content.servers.server;

    // Initialize base class
    super.onInit();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.search.searchChangedStream
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this.serverSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when the server is selected on the list panel
   * @param _server Selected server instance
   */
  public onServerSelect(_server: Server) {
    if (isNullOrEmpty(_server)) { return; }
    this.router.navigate([CoreRoutes.getPath(McsRouteKey.Servers), _server.id]);
  }

  /**
   * Execute the server command according to inputs
   * @param servers Servers to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(serverItem: Server, action: ServerCommand): void {
    if (isNullOrEmpty(serverItem)) { return; }
    let dialogComponent = null;

    // Set dialog references in case of Reset Password, Delete Server, Rename Server etc...
    switch (action) {
      case ServerCommand.ResetVmPassword:
        dialogComponent = ResetPasswordDialogComponent;
        break;

      case ServerCommand.Delete:
        dialogComponent = DeleteServerDialogComponent;
        break;

      case ServerCommand.Rename:
        dialogComponent = RenameServerDialogComponent;
        break;

      case ServerCommand.Suspend:
        dialogComponent = SuspendServerDialogComponent;
        break;

      case ServerCommand.Resume:
        dialogComponent = ResumeServerDialogComponent;
        break;

      default:
        this._serversService.executeServerCommand({ server: serverItem }, action);
        return;
    }

    // Check if the server action should be execute when the dialog result is true
    if (!isNullOrEmpty(dialogComponent)) {
      let dialogRef = this._dialogService.open(dialogComponent, {
        data: serverItem,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this._serversService.executeServerCommand(
            { server: serverItem, result: dialogResult },
            action
          );
        }
      });
    }
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Event that emits when VDC name is selected
   */
  public onSelectVdcByName(event: MouseEvent, resource: ServerPlatform): void {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    if (isNullOrEmpty(resource.resourceId)) { return; }

    this._changeDetectorRef.markForCheck();
    this.router.navigate([
      CoreRoutes.getPath(McsRouteKey.Vdc),
      resource.resourceId
    ]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this.router.navigate([
      CoreRoutes.getPath(McsRouteKey.Servers),
      this.paramId,
      tab.id
    ]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string) {
    if (isNullOrEmpty(id)) { return; }

    // We need to recreate the component in order for the
    // component to generate new instance
    if (!isNullOrEmpty(this.componentHandler)) {
      this.componentHandler.recreateComponent();
    }
    this._getServerById(id);
    this._setSelectedServerById(id);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversRepository,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: Server) => {
      let resourceName = isNullOrEmpty(item.platform) ? 'Others' : item.platform.resourceName;
      let resource: ServerPlatform = this._resourcesKeyMap.get(resourceName);
      if (isNullOrEmpty(resource)) {
        let resourceInstance = new ServerPlatform();
        resourceInstance.resourceName = 'Others';
        resource = !isNullOrEmpty(item.platform.resourceName) ? item.platform : resourceInstance;
      }
      this._resourcesKeyMap.set(resourceName, resource);
      return resource;
    };

    // Listen to all records changed
    this.serverListSource.findAllRecordsMapStream(keyFn)
      .pipe(
        takeUntil(this._destroySubject),
        catchError((error) => {
          this.listStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.serversMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      });
  }

  /**
   * This will set the active server when data was obtained from repository
   * @param serverId Server ID to be the basis of the server
   */
  private _getServerById(serverId: string): void {
    this.serverSubscription = this._serversRepository
      .findRecordById(serverId)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this._setSelectedServerById(response.id);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * This will set the selected server details every selection
   */
  private _setSelectedServerById(serverId: string): void {
    if (isNullOrEmpty(serverId)) { return; }

    // Set the selection of server based on its ID
    let serverFound = this._serversRepository.dataRecords
      .find((server) => server.id === serverId);
    if (isNullOrEmpty(serverFound)) {
      this.selectedServer = { id: serverId } as Server;
      return;
    }

    this.selectedServer = serverFound;
    this._serverService.setSelectedServer(this.selectedServer);
    this.selectedServerName = this.selectedServer.name;
    let hasResourceName = !isNullOrEmpty(
      getSafeProperty(this.selectedServer, (obj) => obj.platform.resourceName)
    );

    let resourceName = (hasResourceName) ?
      this.selectedServer.platform.resourceName : SERVER_LIST_GROUP_OTHERS;
    this.selectedGroupName = resourceName;
  }
}
