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

    let hasPrivateCloudAccess = this._authenticationIdentity.platformSettings.hasPrivateCloud;
    let hasPublicCloudAccess = this._authenticationIdentity.platformSettings.hasPublicCloud;

    // Try Navigate to Private Cloud Dashboard Default Page
    let hasPrivateCloudAccessOnly = hasPrivateCloudAccess && !hasPublicCloudAccess &&
      this._accessControlService.hasAccessToFeature([McsFeatureFlag.PrivateCloudDashboard]);

    if (hasPrivateCloudAccessOnly) {
      this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
      return false;
    }

    let hasPublicCloudAccessOnly = hasPublicCloudAccess && !hasPrivateCloudAccess;
    let hasBothAccessToPublicAndPrivateCloud = hasPublicCloudAccess && hasPrivateCloudAccess;

    if (hasPublicCloudAccessOnly || hasBothAccessToPublicAndPrivateCloud) {
      this._navigationService.navigateTo(RouteKey.ReportOverview);
      return false;
    }

    let noAccessToPublicAndPrivateCloud = !hasPublicCloudAccess && !hasPrivateCloudAccess;

    if (noAccessToPublicAndPrivateCloud) {
      this._navigationService.navigateTo(RouteKey.Catalog);
      return false;
    }
  }
}
