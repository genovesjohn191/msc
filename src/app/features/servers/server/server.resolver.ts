import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ServersService } from '../';

@Injectable()
export class ServerResolver implements Resolve<any> {

  constructor(private _serversService: ServersService) {}

  public resolve(route: ActivatedRouteSnapshot) {
    return this._serversService.getServer(route.params['id']);
  }
}
