import {
  of,
  Observable
} from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

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
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { McsAuthenticationService } from './mcs-authentication.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {

  constructor(
    private _authenticationService: McsAuthenticationService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accesscontrolService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ): Observable<boolean> {
    if (this._authenticationIdentity.isAuthenticated) { return of(true); }

    // We need to update the return url here in order to cater the scenario
    // where the user manually entered the url while no user logged-in
    // and also we need to consider internal users that has catalog permissions.
    this._authenticationService.updateLoginReturnUrl(_routerState.url, true);

    return this._authenticationService.authenticateUser().pipe(
      exhaustMap(identity => {
        if (this._accesscontrolService.hasAccessToFeature(McsFeatureFlag.MaintenanceMode)) {
          this._navigationService.navigateTo(RouteKey.Maintenance);
          return of(false);
        }

        if (identity?.isAnonymous) {
          this._accesscontrolService.setCatalogAccess(true);
          this._navigationService.navigateTo(RouteKey.Catalog);
          return of(false);
        }
        if (!isNullOrEmpty(identity)) {
          this._accesscontrolService.setCatalogAccess(true);
        }
        return of(!isNullOrEmpty(identity));
      })
    );
  }
}
