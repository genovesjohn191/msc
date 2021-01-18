import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';

import { HttpStatusCode } from '@app/models';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';

@Injectable()
export class McsPublicCloudOnlyGuard implements CanActivate {

  constructor(
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _errorHandlerService: McsErrorHandlerService,
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (!this._authenticationIdentity.platformSettings.hasPublicCloud) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
      return false;
    }

    return true;
  }
}
