import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Injectable } from '@angular/core';
import {
  McsAuthenticationService
} from './mcs-authentication.service';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';
import { McsLoggerService } from '../services/mcs-logger.service';

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
    private _loggerService: McsLoggerService,
    private _authenticationService: McsAuthenticationService) {
  }

  public initializeRouteChecking(): void {
    this._loggerService.traceInfo(`Route checking initialized.`);
    /** Register Event for Route Activation */
    this._routerEventHandler = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this._loggerService.traceInfo(`Route navigation ended.`, event.urlAfterRedirects);
          this.onNavigateEnd(event);
        }
      });
  }

  public dispose(): void {
    unsubscribeSafely(this._routerEventHandler);
  }

  public onNavigateEnd(navStart: NavigationEnd) {
    // Ths will check the permission of the token/identity
    this._checkPermissions(navStart);
  }

  private _checkPermissions(navStart: NavigationEnd): void {
    // Get required permissions
    this._loggerService.traceInfo(`Checking permission...`);
    let requiredPermissions: string[] =
    this._getRouteRequiredPermission(navStart.urlAfterRedirects);
    this._loggerService.traceInfo(
      `Route Required Permissions: `,
      navStart.urlAfterRedirects,
      requiredPermissions);
    if (isNullOrEmpty(requiredPermissions)) {
      return;
    }

    // Check if user has permission
    let hasRoutePermission =
      this._authenticationService.hasPermission(requiredPermissions);

    if (!hasRoutePermission) {
      this._loggerService.traceInfo(`ROUTE ACCESS DENIED!`);
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
