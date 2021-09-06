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
import { McsApiService } from '@app/services';

@Injectable()
export class ServerServicesGuard implements CanActivate {

  constructor(
    private _apiService: McsApiService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let serverId = _route.parent.paramMap.get('id');
    return this._apiService.getServer(serverId).pipe(
      map((response) => {
        if (response.isManagedVCloud || response.isManagedVCenter) {
          return true;
        }
        this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
        return false;
      })
    );
  }
}
