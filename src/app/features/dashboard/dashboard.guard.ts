import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsAccessControlService,
  CoreRoutes
} from '@app/core';
import { RouteKey, McsPermission } from '@app/models';

@Injectable()
export class DashboardGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _accesscontrolService: McsAccessControlService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let hasVmAccess = this._accesscontrolService.hasPermission([
      McsPermission.CloudVmAccess,
      McsPermission.DedicatedVmAccess
    ]);
    if (hasVmAccess) {
      this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Servers)]);
      return false;
    }

    let hasFirewallAccess = this._accesscontrolService.hasPermission([
      McsPermission.FirewallConfigurationView
    ]);
    if (hasFirewallAccess) {
      this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Firewalls)]);
      return false;
    }
    return true;
  }
}
