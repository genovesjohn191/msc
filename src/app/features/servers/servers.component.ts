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
import { ServersRepository } from './servers.repository';
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
  DeleteServerDialogComponent,
  RenameServerDialogComponent
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
  public enumDefinition: any;
  public selection: McsSelection<Server>;

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  // Subscription
  private _selectionModeSubscription: any;
  private _notificationsChangeSubscription: any;

  public get serverCommand() {
    return ServerCommand;
  }

  public get excludedCommands(): ServerCommand[] {
    return [ServerCommand.Scale, ServerCommand.Clone];
  }

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._serversRepository) ? 0 :
      this._serversRepository.totalRecordsCount;
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
    private _serversRepository: ServersRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
    this.selection = new McsSelection<Server>(true);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
    this.enumDefinition = this._textProvider.content.enumerations;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
      this._listenToSelectionModeChange();
      this._listenToNotificationsChange();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    if (!isNullOrEmpty(this._selectionModeSubscription)) {
      this._selectionModeSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._notificationsChangeSubscription)) {
      this._notificationsChangeSubscription.unsubscribe();
    }
  }

  /**
   * Return true if all the displayed record is selected otherwise false
   */
  public isAllSelected(): boolean {
    if (isNullOrEmpty(this.dataSource)) { return false; }
    if (!this.selection.hasValue()) { return false; }
    return this.selection.selected.length === this._serversRepository.filteredRecords.length;
  }

  /**
   * Select all displayed record in the table
   */
  public toggleSelectAll(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }

    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this._serversRepository.filteredRecords.forEach((record) => {
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
      return isNullOrEmpty(state) || server.serviceType === ServerServiceType.Managed;
    }).length === 0;
  }

  /**
   * Execute the corresponding action based on top panel commands
   * @param action Action to be set
   */
  public executeTopPanelAction(action: ServerCommand) {
    if (!this.selection.hasValue()) { return; }
    let servers: Server[] = new Array();

    // Get server data based on serverID
    this.selection.selected.forEach((serverId) => {
      let selectedServer = this._serversRepository.filteredRecords
        .find((data) => data.id === serverId);
      servers.push(selectedServer);
    });

    // Execute server command
    this.executeServerCommand(servers, action);
  }

  /**
   * Execute the server command according to inputs
   * @param servers Servers to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(servers: Server | Server[], action: ServerCommand): void {
    if (isNullOrEmpty(servers)) { return; }
    let serverItems: Server[] = new Array();
    let dialogComponent = null;

    // Set server items based on instance if it is single or multiple
    !Array.isArray(servers) ? serverItems.push(servers) : serverItems = servers;

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
        serverItems.forEach((serverItem) => {
          this._serversService.executeServerCommand({ server: serverItem }, action);
        });
        return;
    }

    // Check if the server action should be execute when the dialog result is true
    if (!isNullOrEmpty(dialogComponent)) {
      let dialogRef = this._dialogService.open(dialogComponent, {
        data: servers,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          serverItems.forEach((serverItem) => {
            this._serversService.executeServerCommand(
              { server: serverItem, result: dialogResult },
              action
            );
          });
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
   * Return the active server status
   * @param server Server to be check
   */
  public getServerStatus(server: Server): ServerClientObject {
    return this._serversService.getServerStatus(server);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return this.getServerStatus(server).commandAction === ServerCommand.Delete;
  }

  /**
   * Return true when the server process is on-going and deleting
   * @param server Server to be checked
   */
  public serverOngoing(server: Server): boolean {
    return this.serverDeleting(server) || !server.powerState;
  }

  /**
   * Navigate to server resouce page
   * @param server Server to be used as the data of the page
   */
  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this._router.navigate(['/servers/vdc', server.platform.resourceId]);
  }

  /**
   * Navigate to server details page
   * @param server Server to checked the details
   */
  public navigateToServer(server: Server): void {
    // Do not navigate to server details when server is deleting
    if (isNullOrEmpty(server) || this.serverDeleting(server)) { return; }
    this._router.navigate(['/servers/', server.id]);
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new ServersDataSource(
      this._serversRepository,
      this.enumDefinition,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
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

  /**
   * Listen to notifications changes
   */
  private _listenToNotificationsChange(): void {
    this._notificationsChangeSubscription = this._serversRepository.notificationsChanged
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }
}
