import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsLoggerService } from '../services/mcs-logger.service';

@Injectable()
export class McsRouteHandlerService implements McsInitializer {
  private _destroySubject = new Subject<void>();

  /** This stores the permission required to access a base route. */
  private _routeRequiredPermissions: Map<string, string[]> = new Map([
    ['/servers', ['VmAccess']],
    ['/tickets', ['TicketView']],
    ['/networking/firewalls', ['FirewallConfigurationView']]
  ]);

  constructor(
    private _router: Router,
    private _loggerService: McsLoggerService,
    private _accessControlService: McsAccessControlService) {
  }

  /**
   * Initializes all the router handler/guard events
   */
  public initialize(): void {
    this._loggerService.traceInfo(`Route checking initialized.`);
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this._loggerService.traceInfo(`Route navigation ended.`, event.urlAfterRedirects);
          this._onNavigateEnd(event);
        }
      });
  }

  /**
   * Destroys all the resources
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when navigation ended
   */
  private _onNavigateEnd(navStart: NavigationEnd) {
    this._guardRoute(navStart);
  }

  /**
   * Guards the route if it has permission, otherwise it will redirect to access denied page.
   */
  private _guardRoute(navStart: NavigationEnd): void {
    // Get required permissions
    this._loggerService.traceInfo(`Checking permission...`);
    let requiredPermissions: string[] =
      this._getRouteRequiredPermission(navStart.urlAfterRedirects);
    this._loggerService.traceInfo(
      `Route Required Permissions: `,
      navStart.urlAfterRedirects,
      requiredPermissions);

    if (isNullOrEmpty(requiredPermissions)) { return; }

    // Check if user has permission
    let hasRoutePermission = this._accessControlService.hasPermission(requiredPermissions);
    if (!hasRoutePermission) {
      this._showAccessDenied();
    }
  }

  /**
   * Shows the access denied page
   * `TODO:` Should be sitting under error page
   */
  private _showAccessDenied() {
    this._loggerService.traceInfo(`ROUTE ACCESS DENIED!`);
    this._router.navigate(['/access-denied']);
  }

  /**
   * Gets the required permissions from the identity
   * @param route Route to be checked
   */
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
