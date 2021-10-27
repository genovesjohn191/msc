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
  McsAuthenticationIdentity,
  McsCookieService
} from '@app/core';
import {
  RouteKey,
  McsPermission,
  McsFeatureFlag
} from '@app/models';
import { CommonDefinition } from '@app/utilities';

const engineeringAccount = '93111';
@Injectable()
export class DashboardGuard implements CanActivate {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _cookieService: McsCookieService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    // Try Navigate to Launchpad Projects - Default Page for Engineers
    let activeCompanyId = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT) ||
      this._authenticationIdentity.user?.companyId;
    let hasLaunchpadProjectsAccess =
      this._accessControlService.hasPermission([McsPermission.InternalEngineerAccess]) &&
      this._accessControlService.hasAccessToFeature([McsFeatureFlag.LaunchPad, McsFeatureFlag.DashboardProjects], true) &&
      activeCompanyId === engineeringAccount;
    if (hasLaunchpadProjectsAccess) {
      this._navigationService.navigateTo(RouteKey.LaunchPadDashboardProjects);
      return false;
    }

    let hasPrivateCloudAccess = this._authenticationIdentity.platformSettings.hasPrivateCloud;
    let hasPublicCloudAccess = this._authenticationIdentity.platformSettings.hasPublicCloud;

    // Try Navigate to Private Cloud Dashboard Default Page
    let hasPrivateCloudDashboardAccess = hasPrivateCloudAccess && !hasPublicCloudAccess &&
      this._accessControlService.hasAccessToFeature([McsFeatureFlag.PrivateCloudDashboard]);

    if (hasPrivateCloudDashboardAccess) {
      this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
      return false;
    }

    // Try Navigate to Private Cloud Default Page
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
    if (hasPublicCloudAccess) {
      this._navigationService.navigateTo(RouteKey.Licenses);
      return false;
    }

    this._navigationService.navigateTo(RouteKey.Catalog);
    return false;
  }
}
