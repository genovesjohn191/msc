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
  ServerServiceType
} from '../models';
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent
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
import { ServerList } from 'app/features/servers';

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
  public serverCommandList: ServerCommand[];

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
    this.serverCommandList = new Array();
    this.serverCommand = ServerCommand.None;
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

  public onServerSelect(serverId: any) {
    if (isNullOrEmpty(serverId) || this._serverId === serverId) { return; }

    this._serverId = serverId;
    this._getServerById();

    this.router.navigate(
      ['/servers', serverId],
      { relativeTo: this.activatedRoute }
    );
  }

  public executeServerCommand(server: Server, action: ServerCommand): void {
    let dialogComponent = null;

    switch (action) {
      case ServerCommand.ResetVmPassword:
        dialogComponent = ResetPasswordDialogComponent;
        break;
      case ServerCommand.Delete:
        dialogComponent = DeleteServerDialogComponent;
        break;
      default:
        // do nothing
        break;
    }

    if (!isNullOrEmpty(dialogComponent)) {
      let dialogRef = this._dialogService.open(dialogComponent, {
        data: server,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this._serversService.executeServerCommand(server, action);
        }
      });
    } else {
      this._serversService.executeServerCommand(server, action);
    }
  }

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

  public getActiveServerTooltip(serverId: any) {
    return this._serversService.getActiveServerInformation(serverId);
  }

  /**
   * Return true if server is currently deleting and false if not
   * @param server Server to be check
   */
  public getDeletingServer(serverListItem: ServerList): boolean {
    let isDeleting = false;

    if (!isNullOrEmpty(serverListItem)) {
      let server = new Server();
      server.id = serverListItem.id;
      server.managementName = serverListItem.name;
      server.powerState = serverListItem.powerState;

      let serverStatus = this._serversService.getServerStatus(server);

      switch (serverStatus.notificationStatus) {
        case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
          this.serverListSource.removeDeletedServer(server);

        case CoreDefinition.NOTIFICATION_JOB_FAILED:
          isDeleting = false;
          break;

        default:
          isDeleting = serverStatus.commandAction === ServerCommand.Delete;
          break;
      }
    }

    return isDeleting;
  }

  public onTabChanged(tab: any) {
    if (isNullOrEmpty(this.server) || isNullOrEmpty(this.server.id)) { return; }

    // Navigate route based on current active tab
    this.router.navigate(['servers', this.server.id, tab.id]);
  }

  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server.environment) &&
      isNullOrEmpty(server.environment.resource)) { return; }

    this.router.navigate(['/servers/vdc', server.environment.resource.id]);
  }

  /**
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.serverListSource)) { return; }
    this._initializeListsource();
  }

  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversService,
      this.search
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getServerById(): void {
    this.serverSubscription = this._serverService.getServer(this._serverId)
      .subscribe((response) => {
        this.server = response.content;

        let hasResource = !isNullOrEmpty(this.server.environment)
          && !isNullOrEmpty(this.server.environment.resource);

        let resourceName = (hasResource) ?
          this.server.environment.resource.name : SERVER_LIST_GROUP_OTHERS;

        this.selectedItem = {
          itemId: this.server.id,
          groupName: resourceName
        } as McsListPanelItem;

        this._serverService.setSelectedServer(this.server);
        this._setServerCommandList();
        this._setServerCommand();
        this._changeDetectorRef.markForCheck();
      });
  }

  private _setServerCommandList(): void {
    this.serverCommandList = [
      ServerCommand.Start,
      ServerCommand.Stop,
      ServerCommand.Restart,
      ServerCommand.Scale,
      ServerCommand.Clone,
      ServerCommand.ViewVCloud,
      ServerCommand.ResetVmPassword
    ];

    if (this.server.serviceType === ServerServiceType.SelfManaged) {
      this.serverCommandList.push(ServerCommand.Delete);
      this.serverCommandList.sort(
        (_first: ServerCommand, _second: ServerCommand) => {
          return _first - _second;
        }
      );
    }
  }

  private _setServerCommand(): void {
    if (isNullOrEmpty(this.jobs) && isNullOrEmpty(this.server.powerState)) { return; }

    let command: ServerCommand;
    let activeServerJob = this.jobs.find((job) => {
      return !isNullOrEmpty(job.clientReferenceObject) &&
        job.clientReferenceObject.serverId === this._serverId;
    });

    if (!isNullOrEmpty(activeServerJob)) {
      command = ServerCommand.None;
    } else {
      switch (this.server.powerState) {
        case ServerPowerState.PoweredOn:
          command = ServerCommand.Start;
          break;

        case ServerPowerState.PoweredOff:
          command = ServerCommand.Stop;
          break;

        default:
          command = ServerCommand.None;
          break;
      }
    }

    this.serverCommand = command;
  }

  /**
   * Listener to all the active servers to refresh the view when data is being changed
   */
  private _listenToActiveServers(): void {
    this._activeServerSubscription = this._serversService.activeServersStream
      .subscribe(() => {
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
        this._setServerCommand();
      });
  }
}
