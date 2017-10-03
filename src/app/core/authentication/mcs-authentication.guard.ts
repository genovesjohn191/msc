import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { McsAuthenticationService } from './mcs-authentication.service';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  constructor(private _authenticationService: McsAuthenticationService) { }

  public canActivate(
    activatedRoute: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ) {
    let authToken: string;

    // Set Return URL always
    this._authenticationService.setReturnUrl(routerState.url, activatedRoute.queryParams);

    // Get tokens from cookie / appstate
    authToken = this._authenticationService.getAuthToken(activatedRoute.queryParams);

    if (authToken) {
      this._authenticationService.setAuthToken(authToken);
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
