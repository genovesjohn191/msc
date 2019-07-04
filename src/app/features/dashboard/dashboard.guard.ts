import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import {
  RouteKey,
  McsPermission
} from '@app/models';

@Injectable()
export class DashboardGuard implements CanActivate {

  constructor(
    private _accesscontrolService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Validate VM Access
    let hasVmAccess = this._accesscontrolService.hasPermission([
      McsPermission.CloudVmAccess,
      McsPermission.DedicatedVmAccess
    ]);
    if (hasVmAccess) {
      this._navigationService.navigateTo(RouteKey.Servers);
      return false;
    }

    // Validate Firewall Access
    let hasFirewallAccess = this._accesscontrolService.hasPermission([
      McsPermission.FirewallConfigurationView
    ]);
    if (hasFirewallAccess) {
      this._navigationService.navigateTo(RouteKey.Firewalls);
      return false;
    }
    return true;
  }
}
