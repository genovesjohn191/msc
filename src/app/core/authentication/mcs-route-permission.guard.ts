import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Injectable } from '@angular/core';
import {
  McsAuthenticationService
} from './mcs-authentication.service';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class McsRoutePermissionGuard {
  private _routerEventHandler: any;

  /** This stores the permission required to access a base route. */
  private _routeRequiredPermissions: Map<string, string[]> = new Map([
      ['/servers', ['VmAccess']]
    ]);

  constructor(
    private _router: Router,
    private _authenticationService: McsAuthenticationService) {

    /** Register Event for Route Activation */
    this._routerEventHandler = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.onNavigateEnd(event);
        }
      });
  }

  public onNavigateEnd(navStart: NavigationEnd) {
    // Get required permissions
    let requiredPermissions: string[] = this._getRouteRequiredPermission(navStart.url);
    if (isNullOrEmpty(requiredPermissions)) {
      return;
    }

    // Check if user has permission
    let hasRoutePermission =
      this._authenticationService.hasPermission(requiredPermissions);

    if (!hasRoutePermission) {
      this._router.navigate(['/access-denied']);
    }
  }

  private _getRouteRequiredPermission(route: string): string[] {
    let requiredPermission: string[];
    this._routeRequiredPermissions.forEach((value: string[], key: string) => {

      if (route.startsWith(key)) {
        requiredPermission = this._routeRequiredPermissions.get(key);
      }
    });

    return requiredPermission;
  }
}
