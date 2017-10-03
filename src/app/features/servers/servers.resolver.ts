import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ServersService } from './servers.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ServersResolver implements Resolve<any> {

  constructor(private _serversService: ServersService) { }

  public resolve(_route: ActivatedRouteSnapshot) {
    return this._serversService.getServers()
      .catch((error) => Observable.of({ error }));
  }
}
