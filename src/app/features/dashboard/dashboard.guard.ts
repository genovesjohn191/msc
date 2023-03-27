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

    // Try Navigate to LaunchPad Projects - Default Page for Engineers
    let activeCompanyId = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT) ||
      this._authenticationIdentity.user?.companyId;
    let isImpersonating = this._authenticationIdentity.isImpersonating;
    let hasRequiredPermission = this._accessControlService.hasPermission([
      McsPermission.InternalPrivateCloudEngineerAccess,
      McsPermission.InternalPublicCloudEngineerAccess
    ]);
    let hasLaunchpadProjectsAccess = hasRequiredPermission && activeCompanyId === engineeringAccount
      this._accessControlService.hasAccessToFeature([McsFeatureFlag.LaunchPad, McsFeatureFlag.DashboardProjects], true);

    if (hasLaunchpadProjectsAccess && !isImpersonating) {
      this._navigationService.navigateTo(RouteKey.LaunchPadDashboardProjects);
      return false;
    }

    let companyHasPrivateCloudPlatform = this._authenticationIdentity.platformSettings.hasPrivateCloud;
    let companyHasPublicCloudPlatform = this._authenticationIdentity.platformSettings.hasPublicCloud;

    // Try Navigate to Private Cloud Dashboard Default Page
    let companyHasPrivateCloudPlatformOnly = companyHasPrivateCloudPlatform && !companyHasPublicCloudPlatform &&
      this._accessControlService.hasAccessToFeature([McsFeatureFlag.PrivateCloudDashboard]);

    if (companyHasPrivateCloudPlatformOnly) {
      this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
      return false;
    }

    let companyHasPublicCloudPlatformOnly = companyHasPublicCloudPlatform && !companyHasPrivateCloudPlatform;
    let companyHasBothPublicAndPrivateCloudPlatforms = companyHasPublicCloudPlatform && companyHasPrivateCloudPlatform;

    if (companyHasPublicCloudPlatformOnly || companyHasBothPublicAndPrivateCloudPlatforms) {
      this._navigationService.navigateTo(RouteKey.ReportOverview);
      return false;
    }

    let companyHasNoPublicOrPrivateCloudPlatform = !companyHasPublicCloudPlatform && !companyHasPrivateCloudPlatform;

    if (companyHasNoPublicOrPrivateCloudPlatform) {
      this._navigationService.navigateTo(RouteKey.Catalog);
      return false;
    }
  }
}
