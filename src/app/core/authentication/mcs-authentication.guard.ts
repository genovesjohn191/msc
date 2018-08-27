import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { McsAuthenticationService } from './mcs-authentication.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  constructor(private _authenticationService: McsAuthenticationService) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ) {
    // We need to update the return url here in order to cater the scenario
    // where the user manually entered the url while no user logged-in
    this._authenticationService.updateLoginReturnUrl(_routerState.url);
    return this._authenticationService.IsAuthenticated();
  }
}
