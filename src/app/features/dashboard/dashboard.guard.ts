import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { McsAccessControlService } from '../../core';
import { Observable } from 'rxjs';

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
    let hasVmAccess = this._accesscontrolService.hasPermission(['VmAccess']);
    if (hasVmAccess) {
      this._router.navigate(['./servers']);
      return false;
    }

    let hasFirewallAccess = this._accesscontrolService.hasPermission(['FirewallConfigurationView']);
    if (hasFirewallAccess) {
      this._router.navigate(['/networking/firewalls']);
      return false;
    }
    return true;
  }
}
