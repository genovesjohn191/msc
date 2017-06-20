import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd
} from '@angular/router';
import {
  Server,
  ServerPowerState,
  ServerCommand
} from '../models';
import { CoreDefinition } from '../../../core';
import { ServersService } from '../servers.service';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit, OnDestroy {
  public servers: Server[];
  public server: Server;
  public subscription: any;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server && this.server.serviceType.toLowerCase()
      === CoreDefinition.MANAGED_SERVER.toLowerCase();
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _serversService: ServersService,
  ) {}

  public ngOnInit() {
    if (this._route.snapshot.data.servers.content && this._route.snapshot.data.server.content) {
      this.servers = this._route.snapshot.data.servers.content;
      this.server = this._route.snapshot.data.server.content;
    } else {
      this._router.navigate(['/page-not-found']);
    }
  }

  public executeServerCommand(server: Server, action: string) {
    this._serversService.postServerCommand(
      server.id,
      action,
      {
        serverId: server.id,
        powerState: server.powerState,
        actionState: action
      }
    )
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
