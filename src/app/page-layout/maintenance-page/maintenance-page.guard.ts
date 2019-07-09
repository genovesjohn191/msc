import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { McsFeatureFlag } from '@app/models';
import {
  McsAccessControlService,
  McsNavigationService
} from '@app/core';

@Injectable()
export class McsMaintenancePageGuard implements CanActivate {

  constructor(
    private _accesscontrolService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    let maintenanceModeIsActivated = this._accesscontrolService
      .hasAccessToFeature(McsFeatureFlag.MaintenanceMode);

    if (!maintenanceModeIsActivated) {
      this._navigationService.navigateRoot('/');
      return false;
    }
    return true;
  }
}
