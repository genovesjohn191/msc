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
  McsCompany,
  McsFeatureFlag,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  compareStrings,
  isNullOrEmpty
} from '@app/utilities';

import { McsNavigationService } from '../services/mcs-navigation.service';
import { McsAccessControlService } from './mcs-access-control.service';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { McsAuthenticationService } from './mcs-authentication.service';
import { McsApiService } from '@app/services';
import { McsCookieService } from '../services/mcs-cookie.service';
import { SwitchAccountService } from '../services/switch-account.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {
  private _activeCompany: McsCompany;
  constructor(
    private _apiService: McsApiService,
    private _authenticationService: McsAuthenticationService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accesscontrolService: McsAccessControlService,
    private _cookieService: McsCookieService,
    private _navigationService: McsNavigationService,
    private _switchAccountService: SwitchAccountService
  ) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ): Observable<boolean> {
    if (this._authenticationIdentity.isAuthenticated) { return of(true); }

    if (!isNullOrEmpty(_activatedRoute.queryParams?._companyId) &&
      !this._isSameCompany(_activatedRoute.queryParams?._companyId)) {
      this._getCurrentActiveCompany(_activatedRoute.queryParams._companyId);
    }

    // We need to update the return url here in order to cater the scenario
    // where the user manually entered the url while no user logged-in
    // and also we need to consider internal users that has catalog permissions.
    this._authenticationService.updateLoginReturnUrl(_routerState.url, true);

    return this._authenticationService.authenticateUser().pipe(
      exhaustMap(identity => {
        if (!isNullOrEmpty(_activatedRoute.queryParams?._companyId)) {
          this._updateActiveAccount(_activatedRoute.queryParams._companyId);
        }

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

  private _getCurrentActiveCompany(companyId: string) {
    this._apiService.getCompany(companyId).subscribe(
      (response) => {
        this._activeCompany = response;
      });
  }

  private _updateActiveAccount(companyIdQueryParam: string): void {
    if (this._accesscontrolService.hasPermission(['CompanyView']) && !isNullOrEmpty(this._activeCompany)) {
      this._switchAccountService.switchAccount(this._activeCompany);
    }
    let companyIdIsNum = /^\d+$/g.test(companyIdQueryParam);
    if (!companyIdIsNum || this._isSameCompany(companyIdQueryParam)) {
      this._navigationService.navigateRoot(location.pathname);
    }
  }

  private _isSameCompany(activeCompany: string): boolean {
    return compareStrings(this._cookieService.getEncryptedItem<string>(CommonDefinition.COOKIE_ACTIVE_ACCOUNT), activeCompany) === 0;
  }
}
