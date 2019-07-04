import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { map } from 'rxjs/operators';
import {
  McsFeatureFlag,
  RouteKey
} from '@app/models';
import { McsAuthenticationService } from './mcs-authentication.service';
import { McsAccessControlService } from './mcs-access-control.service';
import { McsNavigationService } from '../services/mcs-navigation.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  constructor(
    private _authenticationService: McsAuthenticationService,
    private _accesscontrolService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ) {
    // We need to update the return url here in order to cater the scenario
    // where the user manually entered the url while no user logged-in
    this._authenticationService.updateLoginReturnUrl(_routerState.url);
    return this._authenticationService.IsAuthenticated().pipe(
      map((isAuthenticated) => {
        let maintenanceModeIsActivated = this._accesscontrolService
          .hasAccessToFeature(McsFeatureFlag.EnableMaintenanceMode);

        if (maintenanceModeIsActivated) {
          this._navigationService.navigateTo(RouteKey.Maintenance);
          return false;
        }
        return isAuthenticated;
      })
    );
  }
}
