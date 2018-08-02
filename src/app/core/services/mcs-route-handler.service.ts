import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Subject,
  BehaviorSubject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { CoreRoutes } from '../core.routes';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsLoggerService } from '../services/mcs-logger.service';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';
import { McsRouteCategory } from '../enumerations/mcs-route-category.enum';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import { McsRouteInfo } from '../models/mcs-route-info';

@Injectable()
export class McsRouteHandlerService implements McsInitializer {

  public onActiveRoute = new BehaviorSubject<McsRouteInfo>(undefined);

  private _activeRoute: McsRouteInfo;
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _titleService: Title,
    private _loggerService: McsLoggerService,
    private _accessControlService: McsAccessControlService,
    private _errorHandlerService: McsErrorHandlerService
  ) {
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
  private _onNavigateEnd(navEnd: NavigationEnd) {
    this._setMainActiveRoute(navEnd.urlAfterRedirects);
    this._validateRoutePermissions(this._activeRoute);
    this._validateRouteFeatureFlag(this._activeRoute);
    this._updateDocumentTitle(this._activeRoute);
  }

  /**
   * Sets the active route based on the string url
   * @param fullUrl The FullUrl to be set as active route
   */
  private _setMainActiveRoute(fullUrl: string): void {
    if (isNullOrEmpty(fullUrl)) { return; }

    let routeInfo = CoreRoutes.getRouteInfoByUrl(fullUrl);

    if (isNullOrEmpty(routeInfo)) {
      routeInfo = new McsRouteInfo();
      routeInfo.routePath = fullUrl;
      routeInfo.enumCategory = McsRouteCategory.None;
    }
    this._activeRoute = routeInfo;
    this.onActiveRoute.next(this._activeRoute);
  }

  /**
   * Validates the current route based on its permissions,
   * and navigate to not forbidden page instead
   */
  private _validateRoutePermissions(_activeRouteDetails: McsRouteInfo): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }
    this._loggerService.traceInfo(`Checking permission...`);
    this._loggerService.traceInfo(
      `Route Required Permissions: `,
      _activeRouteDetails.routePath,
      _activeRouteDetails.requiredPermissions);

    // Check user Permission
    if (!isNullOrEmpty(_activeRouteDetails.requiredPermissions)) {
      let hasRoutePermission = this._accessControlService
        .hasPermission(_activeRouteDetails.requiredPermissions);
      if (!hasRoutePermission) { this._navigateToForbiddenPage(); }
    }
  }

  /**
   * Validates the current route based on its feature flag,
   * and navigate to not found page instead
   */
  private _validateRouteFeatureFlag(_activeRouteDetails: McsRouteInfo): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }
    this._loggerService.traceInfo(`Checking feature flag...`);
    this._loggerService.traceInfo(
      `Route Required Feature Flag: `,
      _activeRouteDetails.routePath,
      _activeRouteDetails.requiredFeatureFlag);

    // Check feature Flag
    if (!isNullOrEmpty(_activeRouteDetails.requiredFeatureFlag)) {
      let featureFlagIsEnabled = this._accessControlService
        .hasAccessToFeature(_activeRouteDetails.requiredFeatureFlag);
      if (!featureFlagIsEnabled) { this._navigateToNotFoundPage(); }
    }
  }

  /**
   * Updates the currently displayed title based on category
   * @param _activeRouteDetails Active route details
   */
  private _updateDocumentTitle(_activeRouteDetails: McsRouteInfo): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }
    this._loggerService.traceInfo(`Displaying title for ${_activeRouteDetails.routePath}`);
    this._titleService.setTitle(_activeRouteDetails.documentTitle);
  }

  /**
   * Navigates to forbidden page
   */
  private _navigateToForbiddenPage() {
    this._loggerService.traceInfo(`ROUTE ACCESS DENIED!`);
    this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.Forbidden);
  }

  /**
   * Navigates to not found page
   */
  private _navigateToNotFoundPage() {
    this._loggerService.traceInfo('FEATURE FLAG IS TURNED OFF!');
    this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.NotFound);
  }
}
