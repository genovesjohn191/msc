import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsFeatureFlag,
  HttpStatusCode
} from '@app/models';
import {
  McsAccessControlService,
  McsErrorHandlerService
} from '@app/core';

@Injectable()
export class McsMaintenancePageGuard implements CanActivate {

  constructor(
    private _accesscontrolService: McsAccessControlService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    let maintenanceModeIsActivated = this._accesscontrolService
      .hasAccessToFeature(McsFeatureFlag.EnableMaintenanceMode);

    if (!maintenanceModeIsActivated) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
      return false;
    }
    return true;
  }
}
