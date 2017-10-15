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
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand,
  ServerServiceType
} from '../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsListPanelItem,
  McsSearch
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';
import { ServersService } from '../servers.service';
import { ServerService } from '../server/server.service';
import { ServerListSource } from './server.listsource';

const SERVER_LIST_GROUP_OTHERS = 'Others';

@Component({
  selector: 'mcs-server',
  styleUrls: ['./server.component.scss'],
  templateUrl: './server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('search')
  public search: McsSearch;

  public server: Server;
  public activeServerSubscription: any;
  public selectedServerSubscription: any;
  public serversTextContent: any;
  public serverTextContent: any;
  public serverListSource: ServerListSource | null;

  private _serverId: any;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server && this.server.serviceType === ServerServiceType.Managed;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  private _serverSubscription: any;
  public get serverSubscription(): any {
    return this._serverSubscription;
  }
  public set serverSubscription(value: any) {
    this._serverSubscription = value;
  }

  private _selectedItem: McsListPanelItem;
  public get selectedItem(): McsListPanelItem {
    return this._selectedItem;
  }
  public set selectedItem(value: McsListPanelItem) {
    this._selectedItem = value;
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.server = new Server();
  }

  public ngOnInit() {
    this.serversTextContent = this._textContentProvider.content.servers;
    this.serverTextContent = this._textContentProvider.content.servers.server;
    this._serverId = this._activatedRoute.snapshot.paramMap.get('id');

    this._getServerById();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    if (this.selectedServerSubscription) {
      this.selectedServerSubscription.unsubscribe();
    }
    if (this.activeServerSubscription) {
      this.activeServerSubscription.unsubscribe();
    }
  }

  public onServerSelect(serverId: any) {
    if (isNullOrEmpty(serverId) || this._serverId === serverId) { return; }

    this._serverId = serverId;
    this._getServerById();

    this._router.navigate(
      ['/servers', serverId],
      { relativeTo: this._activatedRoute }
    );
  }

  public executeServerCommand(server: Server, action: string) {
    this._serversService.postServerCommand(
      server.id,
      action,
      {
        serverId: server.id,
        powerState: server.powerState,
        commandAction: ServerCommand[action]
      } as ServerClientObject)
      .subscribe(() => {
        // Subscribe to execute the command post
      });
  }

  public getActionStatus(server: Server): any {
    if (!server) { return undefined; }
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
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.serverListSource)) { return; }
    this._initializeListsource();
  }

  private _initializeListsource(): void {
    this.serverListSource = new ServerListSource(
      this._serversService,
      this.search
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getServerById(): void {
    this.serverSubscription = this._serverService.getServer(this._serverId)
      .subscribe((response) => {
        this.server = response.content;
        this.selectedItem = {
          itemId: this.server.id,
          groupName: (this.server.vdcName) ? this.server.vdcName : SERVER_LIST_GROUP_OTHERS
        } as McsListPanelItem;

        this._serverService.setSelectedServer(this.server);
        this._changeDetectorRef.markForCheck();
      });
  }
}
