import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { resolveEnvVar, isNullOrEmpty } from '../../utilities';
import { McsAuthenticationService } from './mcs-authentication.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  private _enablePassingJwtInUrl: boolean;

  constructor(private _authenticationService: McsAuthenticationService) {
    this._enablePassingJwtInUrl =
      resolveEnvVar('ENABLE_PASSING_JWT_IN_URL', 'true').toLowerCase() === 'true';
  }

  public canActivate(
    activatedRoute: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ) {
    let authToken: string;
    let headerToken: any;

    // Set Return URL always
    this._authenticationService.setReturnUrl(routerState.url, activatedRoute.queryParams);

    // Get the JWT Token from header and cookie
    headerToken = this._enablePassingJwtInUrl ? activatedRoute.queryParams : undefined;
    authToken = this._authenticationService.getAuthToken(headerToken);

    if (!isNullOrEmpty(authToken)) {
      if (this._enablePassingJwtInUrl) { this._authenticationService.setAuthToken(authToken); }
      return this._authenticationService.IsAuthenticated(authToken)
        .map((response) => {
          return response;
        });
    } else {
      // Redirect to login page of SSO (IDP)
      this._authenticationService.logIn();
      return Observable.of(false);
    }
  }
}
