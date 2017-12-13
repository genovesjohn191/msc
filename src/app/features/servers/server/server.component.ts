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
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerPowerState,
  ServerCommand,
  ServerServiceType,
  ServerClientObject
} from '../models';
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent
} from '../shared';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsListPanelItem,
  McsSearch,
  McsDialogService,
  McsApiJob,
  McsNotificationContextService,
  McsRoutingTabBase
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';
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

  public jobs: McsApiJob[];
  public server: Server;
  public serverSubscription: Subscription;
  public serversTextContent: any;
  public serverTextContent: any;
  public serverListSource: ServersListSource | null;

  private _serverId: any;
  private _activeServerSubscription: any;
  private _notificationsSubscription: any;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server && this.server.serviceType === ServerServiceType.Managed;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ANGLE_DOUBLE_RIGHT;
  }

  private _selectedItem: McsListPanelItem;
  public get selectedItem(): McsListPanelItem {
    return this._selectedItem;
  }
  public set selectedItem(value: McsListPanelItem) {
    this._selectedItem = value;
  }

  private _serverCommand: ServerCommand;
  public get serverCommand(): ServerCommand {
    return this._serverCommand;
  }
  public set serverCommand(value: ServerCommand) {
    if (this.serverCommand !== value) {
      this._serverCommand = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationContextService: McsNotificationContextService
  ) {
    super(_router, _activatedRoute);
    this.jobs = new Array<McsApiJob>();
    this.server = new Server();
  }

  public ngOnInit() {
    this.serversTextContent = this._textContentProvider.content.servers;
    this.serverTextContent = this._textContentProvider.content.servers.server;
    this._serverId = this.activatedRoute.snapshot.paramMap.get('id');

    this._getServerById();
    this._listenToNotificationsStream();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
      this._listenToActiveServers();
    });
  }

  public ngOnDestroy() {
    super.dispose();
    if (!isNullOrEmpty(this.serverSubscription)) {
      this.serverSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._activeServerSubscription)) {
      this._activeServerSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._notificationsSubscription)) {
      this._notificationsSubscription.unsubscribe();
    }
  }

  /**
   * Event that emits when the server is selected
   * @param serverId Server id of the selected server
   */
  public onServerSelect(serverId: any) {
    if (isNullOrEmpty(serverId) || this._serverId === serverId) { return; }

    this._serverId = serverId;
    this._getServerById();

    this.router.navigate(
      ['/servers', serverId],
      { relativeTo: this.activatedRoute }
    );
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
   * Return the status Icon key based on the status of the server
   * @param state Server status
   */
  public getStateIconKey(state: number): string {
    let stateIconKey: string = '';

    switch (state as ServerPowerState) {
      case ServerPowerState.Unresolved:   // Red
      case ServerPowerState.Deployed:
      case ServerPowerState.Suspended:
      case ServerPowerState.Unknown:
      case ServerPowerState.Unrecognised:
      case ServerPowerState.PoweredOff:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ServerPowerState.Resolved:   // Amber
      case ServerPowerState.WaitingForInput:
      case ServerPowerState.InconsistentState:
      case ServerPowerState.Mixed:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case ServerPowerState.PoweredOn:  // Green
      default:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

    }
    return stateIconKey;
  }

  /**
   * Return the active server tooltip information
   * @param serverId Server ID
   */
  public getActiveServerTooltip(serverId: any) {
    return this._serversService.getActiveServerInformation(serverId);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return this._serversService.getServerStatus(server).commandAction === ServerCommand.Delete;
  }

  /**
   * Return the active server status
   * @param server Server to be check
   */
  public get serverStatus(): ServerClientObject {
    return this._serversService.getServerStatus(this.server);
  }

  /**
   * Event that emits when tab is changed
   */
  public onTabChanged(tab: any) {
    if (isNullOrEmpty(this.server) || isNullOrEmpty(this.server.id)) { return; }
    // Navigate route based on current active tab
    this.router.navigate(['servers', this.server.id, tab.id]);
  }

  /**
   * Navigate to resources
   * @param server Server to navigate from
   */
  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this.router.navigate(['/servers/vdc', server.platform.resourceId]);
  }

  /**
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.serverListSource)) { return; }
    this._initializeListsource();
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversService,
      this.search
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get the corresponding server by id
   */
  private _getServerById(): void {
    this.serverSubscription = this._serverService.getServer(this._serverId)
      .subscribe((response) => {
        this.server = response.content;

        let hasResourceName = !isNullOrEmpty(this.server.platform)
          && !isNullOrEmpty(this.server.platform.resourceName);

        let resourceName = (hasResourceName) ?
          this.server.platform.resourceName : SERVER_LIST_GROUP_OTHERS;

        this.selectedItem = {
          itemId: this.server.id,
          groupName: resourceName
        } as McsListPanelItem;

        this._serverService.setSelectedServer(this.server);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener to all the active servers to refresh the view when data is being changed
   */
  private _listenToActiveServers(): void {
    this._activeServerSubscription = this._serversService.activeServersStream
      .subscribe((activeServers) => {
        // Update the datasource of the table when job is completed
        if (!isNullOrEmpty(activeServers)) {
          activeServers.forEach((activeServer) => {
            this._updateListsource(activeServer);
          });
        }
        // Refresh the view
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener for notifications changed
   */
  private _listenToNotificationsStream(): void {
    this._notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((jobs) => {
        this.jobs = jobs;
      });
  }

  /**
   * Update table datasource of the servers listing
   * @param activeServer Active server to be served as the basis of the update
   */
  private _updateListsource(activeServer: ServerClientObject): void {
    // Check if job is completed
    let jobCompleted = !isNullOrEmpty(activeServer) &&
      activeServer.notificationStatus === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
    if (!jobCompleted) { return; }

    // Update datasource data
    switch (activeServer.commandAction) {
      case ServerCommand.Delete:
        this.serverListSource.removeDeletedServer(activeServer.serverId);
        break;
      case ServerCommand.Rename:
        if (this.server.id === activeServer.serverId) {
          this.server.name = activeServer.newName;
        }
        this.serverListSource.renameServer(activeServer.serverId, activeServer.newName);
        break;

      default:
        // Do nothing
        break;
    }
  }
}
