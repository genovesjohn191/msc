import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand
} from '../models';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../core';
import { ServersService } from '../servers.service';
import { ServerService } from '../server/server.service';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit, OnDestroy {
  public servers: Server[];
  public server: Server;
  public selectedServerSubscription: any;
  public serverTextContent: any;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server && this.server.serviceType.toLowerCase()
      === CoreDefinition.MANAGED_SERVER.toLowerCase();
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _serversService: ServersService,
    private _serverService: ServerService,
    private _textContentProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.selectedServerSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        this.server = server;
        if (this.server) {
          this.server.powerState = this._serversService.getActiveServerPowerState(this.server);
        }
      });

    if (this._route.snapshot.data.servers.content && this._route.snapshot.data.server.content) {
      this.servers = this._route.snapshot.data.servers.content;
      this.server = this._route.snapshot.data.server.content;
      this.serverTextContent = this._textContentProvider.content.servers.server;
    } else {
      this._router.navigate(['/page-not-found']);
    }
  }

  public onServerSelect(event: any) {
    if (event) {
      this._serverService.setSelectedServer(event);
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

  public ngOnDestroy() {
    if (this.selectedServerSubscription) {
      this.selectedServerSubscription.unsubscribe();
    }
  }
}
