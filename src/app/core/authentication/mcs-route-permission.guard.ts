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
    ['/servers', ['VmAccess']],
    ['/tickets', ['TicketView']],
    ['/networking/firewalls', ['FirewallConfigurationView']]
  ]);

  constructor(
    private _router: Router,
    private _authenticationService: McsAuthenticationService) {
  }

  public initializeRouteChecking(): void {
    /** Register Event for Route Activation */
    this._routerEventHandler = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.onNavigateEnd(event);
        }
      });
  }

  public dispose(): void {
    if (!isNullOrEmpty(this._routerEventHandler)) {
      this._routerEventHandler.unsubscribe();
    }
  }

  public onNavigateEnd(navStart: NavigationEnd) {
    // This will check the token if its not expired.
    // If the token is expired it will redirect automatic to login page
    this._checkAuthToken();

    // Ths will check the permission of the token/identity
    this._checkPermissions(navStart);
  }

  private _checkAuthToken(): void {
    // Get token if exist
    let authToken = this._authenticationService.getAuthToken();
    if (isNullOrEmpty(authToken)) {
      // TODO: Set the logout temporary to fixed the issue of error in login page
      this._authenticationService.logOut();
    }
  }

  private _checkPermissions(navStart: NavigationEnd): void {
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
    this._routeRequiredPermissions.forEach((_value: string[], key: string) => {

      if (route.startsWith(key)) {
        requiredPermission = this._routeRequiredPermissions.get(key);
      }
    });

    return requiredPermission;
  }
}
