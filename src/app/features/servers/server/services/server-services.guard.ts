import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {
  Observable
} from 'rxjs';
import { map } from 'rxjs/operators';
import { McsErrorHandlerService } from '@app/core';
import { HttpStatusCode } from '@app/models';
import { McsServersRepository } from '@app/services';

@Injectable()
export class ServerServicesGuard implements CanActivate {

  constructor(
    private _serverRepository: McsServersRepository,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    let serverId = _route.parent.paramMap.get('id');
    return this._serverRepository.getById(serverId).pipe(
      map((response) => {
        if (response.isManagedVCloud) {
          return true;
        }
        this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
        return false;
      })
    );
  }
}
