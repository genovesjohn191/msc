import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ServersService } from '../servers.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ServerResolver implements Resolve<any> {

  constructor(
    private _router: Router,
    private _serversService: ServersService
  ) { }

  public resolve(route: ActivatedRouteSnapshot) {
    return this._serversService.getServer(route.params['id'])
      .catch((error) => Observable.of({ error }));
  }
}
