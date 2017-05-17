import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ServersService } from './servers.service';

@Injectable()
export class ServersResolver implements Resolve<any> {

  constructor(private _serversService: ServersService) {}

  public resolve(route: ActivatedRouteSnapshot) {
    return this._serversService.getServers();
  }
}
