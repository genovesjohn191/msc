import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ServersService } from './servers.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ServersResolver implements Resolve<any> {

  constructor(
    private _router: Router,
    private _serversService: ServersService
  ) {}

  public resolve(route: ActivatedRouteSnapshot) {
    return this._serversService.getServers()
      .catch((error) => Observable.of({error}));
  }
}
