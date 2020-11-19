import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { McsAuthenticationIdentity, McsErrorHandlerService } from '@app/core';
import { HttpStatusCode } from '@app/models';

@Injectable()
export class LaunchPadGuard implements CanActivate {

  constructor(
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _errorHandlerService: McsErrorHandlerService
    ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (this._authenticationIdentity.isImpersonating) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
    }

    return !this._authenticationIdentity.isImpersonating;
  }
}
