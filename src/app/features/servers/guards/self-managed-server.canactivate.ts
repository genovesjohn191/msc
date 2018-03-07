import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsErrorHandlerService,
  McsHttpStatusCode
} from '../../../core';
import { ServersRepository } from '../servers.repository';
import { ServerServiceType } from '../models';

@Injectable()
export class CanActivateSelfManagedServer implements CanActivate {

  constructor(
    private _serversRepository: ServersRepository,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  /**
   * Load route if the server is self-managed, otherwise it
   * will navigate to 404 page
   * @param route Route
   */
  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    return this._serversRepository
      .findRecordById(_route.parent.paramMap.get('id'))
      .map((server) => {
        if (server.serviceType === ServerServiceType.Managed) {
          this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.NotFound);
          return false;
        }
        return true;
      });
  }
}
