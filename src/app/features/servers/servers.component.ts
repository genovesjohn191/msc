import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { ServersService } from './servers.service';
import { ServersDataSource } from './servers.datasource';
/** Models */
import {
  Server,
  ServerPowerState,
  ServerCommand,
  ServerServiceType,
  ServerClientObject
} from './models';
/** Shared */
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent
} from './shared';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator,
  McsBrowserService,
  McsDeviceType,
  McsSelection,
  McsTableListingBase,
  McsDialogService
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  getRecordCountLabel
} from '../../utilities';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent
  extends McsTableListingBase<ServersDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public selection: McsSelection<Server>;

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  // Subscription
  private _activeServerSubscription: any;
  private _selectionModeSubscription: any;

  public get serverCommand() {
    return ServerCommand;
  }

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SERVER_LISTING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEW_SERVER;
  }

  public get startIconKey(): string {
    return CoreDefinition.ASSETS_SVG_START;
  }

  public get stopIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STOP;
  }

  public get restartIconKey(): string {
    return CoreDefinition.ASSETS_SVG_RESTART;
  }

  public get deleteIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: McsDialogService,
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
    this.selection = new McsSelection<Server>(true);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
      this._listenToActiveServers();
      this._listenToSelectionModeChange();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    if (!isNullOrEmpty(this._activeServerSubscription)) {
      this._activeServerSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._selectionModeSubscription)) {
      this._selectionModeSubscription.unsubscribe();
    }
  }

  /**
   * Return true if all the displayed record is selected otherwise false
   */
  public isAllSelected(): boolean {
    if (isNullOrEmpty(this.dataSource)) { return false; }
    if (!this.selection.hasValue()) { return false; }
    return this.selection.selected.length === this.dataSource.displayedRecord.length;
  }

  /**
   * Select all displayed record in the table
   */
  public toggleSelectAll(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }

    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.displayedRecord.forEach((record) => {
        this.selection.select(record.id);
      });
    }
  }

  /**
   * Set command list for each server
   */
  public setServerCommandList(server: Server): ServerCommand[] {
    if (isNullOrEmpty(server)) { return new Array<ServerCommand>(); }

    let serverCommandList = [
      ServerCommand.Start,
      ServerCommand.Stop,
      ServerCommand.Restart,
      ServerCommand.ViewVCloud,
      ServerCommand.ResetVmPassword
    ];

    if (server.serviceType === ServerServiceType.SelfManaged) {
      serverCommandList.push(ServerCommand.Delete);
      serverCommandList.sort(
        (_first: ServerCommand, _second: ServerCommand) => {
          return _first - _second;
        }
      );
    }

    return serverCommandList;
  }

  /**
   * Return true when Start button on the top panel is disabled
   *
   * `@Note`: All selected servers must be powered OFF
   */
  public get startable(): boolean {
    return this.selection.selected.filter((serverId) => {
      let server = this.dataSource.getDisplayedServerById(serverId);
      let serverStatus = this.getServerStatus(server);
      let state = serverStatus.powerState;
      return state !== ServerPowerState.PoweredOff;
    }).length === 0;
  }

  /**
   * Return true when Stop button on the top panel is disabled
   *
   * `@Note`: All selected servers must be powered ON
   */
  public get stoppable(): boolean {
    return this.selection.selected.filter((serverId) => {
      let server = this.dataSource.getDisplayedServerById(serverId);
      let serverStatus = this.getServerStatus(server);
      let state = serverStatus.powerState;
      return state !== ServerPowerState.PoweredOn;
    }).length === 0;
  }

  /**
   * Return true when Restart button on the top panel is disabled
   *
   * `@Note`: All selected servers must be powered ON
   */
  public get restartable(): boolean {
    return this.stoppable;
  }

  /**
   * Return true when Delete button on the top panel is disabled
   *
   * `@Note`: All selected servers should not processing any request
   */
  public get deletable(): boolean {
    return this.selection.selected.filter((serverId) => {
      let server = this.dataSource.getDisplayedServerById(serverId);
      let serverStatus = this.getServerStatus(server);
      let state = serverStatus.powerState;
      return isNullOrEmpty(state);
    }).length === 0;
  }

  /**
   * Execute the corresponding action based on top panel commands
   * @param action Action to be set
   */
  public executeTopPanelAction(action: ServerCommand) {
    if (!this.selection.hasValue()) { return; }

    let isDelete = action === ServerCommand.Delete;
    let servers = new Array<Server>();

    this.selection.selected.forEach((serverId) => {
      let selectedServer = this.dataSource.displayedRecord
        .find((data) => data.id === serverId);

      if (isDelete) {
         servers.push(selectedServer);
      } else {
        this.executeServerCommand(selectedServer, action);
      }
    });

    if (isDelete && !isNullOrEmpty(servers)) {
      let dialogRef = this._dialogService.open(DeleteServerDialogComponent, {
        data: servers,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          servers.forEach((server) => {
            this._serversService.executeServerCommand(server, action);
          });
        }
      });
    }
  }

  /**
   * Execute the server command according to inputs
   * @param server Server to process the action
   * @param action Action to be execute
   */
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

  /**
   * Return the action status of the server
   * @param server Server to get the action to
   */
  public getActionStatus(server: Server): any {
    let status: ServerCommand;

    switch (server.powerState) {
      case ServerPowerState.PoweredOn:
        status = ServerCommand.Start;
        break;

      case ServerPowerState.PoweredOff:
        status = ServerCommand.Stop;
        break;

      default:
        status = ServerCommand.None;
        break;
    }
    return status;
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
   * This will navigate to new server page
   */
  public onClickNewServerButton() {
    this._router.navigate(['./servers/create']);
  }

  /**
   * Return the active server tooltip information
   * @param serverId Server ID
   */
  public getActiveServerTooltip(serverId: any) {
    return this._serversService.getActiveServerInformation(serverId);
  }

  /**
   * Return the server type according to status
   * @param serviceType Service type of the server
   */
  public getServiceTypeText(serviceType: ServerServiceType): string {
    let serviceTypeText = '';

    switch (serviceType) {
      case ServerServiceType.SelfManaged:
        serviceTypeText = CoreDefinition.SERVER_SELF_MANAGED;
        break;

      case ServerServiceType.Managed:
      default:
        serviceTypeText = CoreDefinition.SERVER_MANAGED;
        break;
    }

    return serviceTypeText;
  }

  /**
   * Return the active server status
   * @param server Server to be check
   */
  public getServerStatus(server: Server): ServerClientObject {
    return this._serversService.getServerStatus(server);
  }

  /**
   * Return true if server is currently deleting and false if not
   * @param server Server to be check
   */
  public getDeletingServer(server: Server): boolean {
    let isDeleting = false;

    if (!isNullOrEmpty(server)) {
      let serverStatus = this.getServerStatus(server);

      if (serverStatus.commandAction === ServerCommand.Delete) {
        switch (serverStatus.notificationStatus) {
          case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
            this.dataSource.removeDeletedServer(server);

          case CoreDefinition.NOTIFICATION_JOB_FAILED:
            isDeleting = false;
            break;

          default:
            isDeleting = true;
            break;
        }
      }
    }

    return isDeleting;
  }

  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server.platform)) { return; }

    this._router.navigate(['/servers/vdc', server.platform.resourceId]);
  }

  public toggleSelection(server: Server): void {
    if (isNullOrEmpty(server)) { return; }

    if (!this.getDeletingServer(server)) {
      this.selection.toggle(server.id);
    }
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new ServersDataSource(
      this._serversService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Listener to all the active servers to refresh the view when data is being changed
   */
  private _listenToActiveServers(): void {
    this._activeServerSubscription = this._serversService.activeServersStream
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener to selection mode change in all servers
   */
  private _listenToSelectionModeChange(): void {
    this._selectionModeSubscription = this.browserService.deviceTypeStream
      .subscribe((deviceType) => {
        let multipleSelection = !(deviceType === McsDeviceType.MobileLandscape ||
          deviceType === McsDeviceType.MobilePortrait);

        this.selection = new McsSelection<Server>(multipleSelection);
      });
  }
}
