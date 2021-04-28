import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import {
  McsFeatureFlag,
  RouteKey
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { McsNavigationService } from '../services/mcs-navigation.service';
import { McsAccessControlService } from './mcs-access-control.service';
import { McsAuthenticationService } from './mcs-authentication.service';

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
    return this._authenticationService.authenticateUser().pipe(
      map(identity => {
        if (this._accesscontrolService.hasAccessToFeature(McsFeatureFlag.MaintenanceMode)) {
          this._navigationService.navigateTo(RouteKey.Maintenance);
          return false;
        }

        if (identity?.isAnonymous) {
          this._navigationService.navigateTo(RouteKey.Catalog);
          return false;
        }
        this._accesscontrolService.setCatalogAccess(true);
        return !isNullOrEmpty(identity);
      })
    );
  }
}
