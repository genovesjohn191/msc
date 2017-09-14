import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
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
  ServerPlatform,
  ServerServiceType
} from '../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsListPanelItem,
  McsSearch
} from '../../../core';
import { ServersService } from '../servers.service';
import { ServerService } from '../server/server.service';
import { ServerListSource } from './server.listsource';

const SERVER_LIST_GROUP_OTHERS = 'Others';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit, OnDestroy {
  @ViewChild('search')
  public search: McsSearch;

  public server: Server;
  public activeServerSubscription: any;
  public selectedServerSubscription: any;
  public serverTextContent: any;
  public serverListSource: ServerListSource | null;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server && this.server.serviceType === ServerServiceType.Managed;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.server = new Server();
  }

  public ngOnInit() {
    this.serverListSource = new ServerListSource(
      this._serversService,
      this.search
    );

    this.selectedServerSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        this.server = server;
      });

    if (this._route.snapshot.data.server.content) {
      this.serverTextContent = this._textContentProvider.content.servers.server;
      this.server = this._route.snapshot.data.server.content;
      this.onServerSelect(this.server.id);
      this.serverListSource.selectedElement = new McsListPanelItem();
      this.serverListSource.selectedElement.itemId = this.server.id;
      this.serverListSource.selectedElement.groupName = (this.server.vdcName) ?
        this.server.vdcName : SERVER_LIST_GROUP_OTHERS ;
    } else {
      this._router.navigate(['/page-not-found']);
    }
  }

  public onServerSelect(serverId: any) {
    if (serverId) {
      this._router.navigate(['/servers', serverId]);
      this._serverService.setSelectedServer(serverId);
    }
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
      .subscribe((response) => {
        // console.log(response);
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

  public ngOnDestroy() {
    if (this.selectedServerSubscription) {
      this.selectedServerSubscription.unsubscribe();
    }
    if (this.activeServerSubscription) {
      this.activeServerSubscription.unsubscribe();
    }
  }
}
