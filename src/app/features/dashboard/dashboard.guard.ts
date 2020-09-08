import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsAccessControlService,
  McsNavigationService,
  McsAuthenticationIdentity
} from '@app/core';
import {
  RouteKey,
  McsPermission
} from '@app/models';

@Injectable()
export class DashboardGuard implements CanActivate {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    // Try Navigate to Private Cloud Default Page
    let hasPrivateCloudAccess = this._authenticationIdentity.platformSettings.hasPrivateCloud;
    if (hasPrivateCloudAccess) {
      // Try Navigate to Compute
      let hasVmAccess = this._accessControlService.hasPermission([
        McsPermission.CloudVmAccess,
        McsPermission.DedicatedVmAccess
      ]);
      if (hasVmAccess) {
        this._navigationService.navigateTo(RouteKey.Servers);
        return false;
      }

      // Try Navigate to Firewalls
      let hasFirewallAccess = this._accessControlService.hasPermission([
        McsPermission.FirewallConfigurationView
      ]);
      if (hasFirewallAccess) {
        this._navigationService.navigateTo(RouteKey.Firewalls);
        return false;
      }
    }

    // Try Navigate to Public Cloud Default Page
    let hasPublicCloudAccess = this._authenticationIdentity.platformSettings.hasPublicCloud;
    if (hasPublicCloudAccess) {
      this._navigationService.navigateTo(RouteKey.Licenses);
      return false;
    }

    this._navigationService.navigateTo(RouteKey.Catalog);
    return false;
  }
}
