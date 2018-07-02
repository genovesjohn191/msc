import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoreConfig } from '../core.config';
import { isNullOrEmpty } from '../../utilities';
import { McsAuthenticationService } from './mcs-authentication.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  private _enablePassingJwtInUrl: boolean;

  constructor(
    private _authenticationService: McsAuthenticationService,
    private _coreConfig: CoreConfig
  ) { }

  public canActivate(
    activatedRoute: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ) {
    let authToken: string;
    let headerToken: any;

    // Set enable passing JWT in url flag
    this._enablePassingJwtInUrl = this._coreConfig.enablePassingJwtInUrl;

    // Set Return URL always
    this._authenticationService.setReturnUrl(routerState.url, activatedRoute.queryParams);

    // Get the JWT Token from header and cookie
    headerToken = this._enablePassingJwtInUrl ? activatedRoute.queryParams : undefined;
    authToken = this._authenticationService.getAuthToken(headerToken);

    if (!isNullOrEmpty(authToken)) {
      if (this._enablePassingJwtInUrl) { this._authenticationService.setAuthToken(authToken); }
      return this._authenticationService.IsAuthenticated(authToken)
        .pipe(
          map((response) => {
            return response;
          })
        );
    } else {
      // Redirect to login page of SSO (IDP)
      this._authenticationService.logIn();
      return of(false);
    }
  }
}
