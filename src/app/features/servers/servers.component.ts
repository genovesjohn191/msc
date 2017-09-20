import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ServersService } from './servers.service';
import { ServersDataSource } from './servers.datasource';
/** Models */
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand,
  ServerServiceType
} from './models';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator
} from '../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../utilities';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  // Filter selector variables
  public columnSettings: any;

  // Table variables
  public dataSource: ServersDataSource;
  public dataColumns: string[];

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get successfullyObtained(): boolean {
    return isNullOrEmpty(this.dataSource) ? false : this.dataSource.successfullyObtained;
  }

  public get hasServers(): boolean {
    return this.successfullyObtained === true && this.totalRecordCount > 0;
  }

  public get displayErrorMessage(): boolean {
    return this.dataSource && (!this.hasServers ||
      this.successfullyObtained) === false;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SERVER_LISTING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _router: Router
  ) {
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initiliazeDatasource();
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
  }

  /**
   * Execute the server command according to inputs
   * @param server Server to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(server: Server, action: string) {
    this._serversService.postServerCommand(
      server.id,
      action,
      {
        serverId: server.id,
        powerState: server.powerState,
        commandAction: ServerCommand[action]
      } as ServerClientObject)
      .subscribe((response) => {
        // This will execute the process
      });
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
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
    }
  }

  /**
   * This will navigate to new server page
   * @param event Event invoked
   */
  public onClickNewServerButton(event: any) {
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
   * Return the server powerstate based on the active server status
   * @param server Server to be check
   */
  public getServerPowerstate(server: Server): number {
    let serverPowerstate = server.powerState;

    if (isNullOrEmpty(this._serversService.activeServers)) {
      return serverPowerstate;
    } else {
      for (let active of this._serversService.activeServers) {
        if (active.serverId === server.id) {
          // Update the powerstate of the corresponding server based on the row
          serverPowerstate = this._serversService.getActiveServerPowerState(active);
          server.powerState = serverPowerstate;
          break;
        }
      }
      return serverPowerstate;
    }
  }

  /**
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initiliazeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new ServersDataSource(
      this._serversService,
      this.paginator,
      this.search
    );
  }
}
