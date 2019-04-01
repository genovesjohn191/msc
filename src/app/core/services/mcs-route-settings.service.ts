import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsRouteInfo,
  HttpStatusCode
} from '@app/models';
import {
  isNullOrEmpty,
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import { McsLoggerService } from './mcs-logger.service';
import { McsErrorHandlerService } from './mcs-error-handler.service';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';
import { CoreEvent } from '../core.event';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';

@Injectable()
export class McsRouteSettingsService implements McsDisposable {
  private _routeHandler: Subscription;

  constructor(
    private _titleService: Title,
    private _eventDispatcher: EventBusDispatcherService,
    private _errorHandlerService: McsErrorHandlerService,
    private _loggerService: McsLoggerService,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _authenticationService: McsAuthenticationService
  ) {
    this._registerEvents();
  }

  /**
   * Destroys all the resources
   */
  public dispose(): void {
    unsubscribeSafely(this._routeHandler);
  }

  /**
   * Registers all the events
   */
  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      CoreEvent.routeChange, this._onRouteChanged.bind(this));
  }

  /**
   * Event that emits when the route has been changed
   * @param routeInfo Route to be emitted
   */
  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    this._scrollPageToTop();
    this._applySettingsByActiveRoute(routeInfo);
  }

  /**
   * Scrolls to top when route has been changed
   */
  private _scrollPageToTop(): void {
    let scrollableElements = this._scrollDispatcher.getScrollableItems();
    if (isNullOrEmpty(scrollableElements)) { return; }

    scrollableElements.forEach((item) => {
      let scrollableElement = item.getElementRef().nativeElement;
      this._scrollDispatcher.scrollToElement(scrollableElement, 0, 0);
    });
  }

  /**
   * Apply the settings based on the active route
   * @param activeRoute Activated route information
   */
  private _applySettingsByActiveRoute(activeRoute: McsRouteInfo) {
    this._validateRoutePermissions(activeRoute);
    this._validateRouteFeatureFlag(activeRoute);
    this._updateDocumentTitle(activeRoute);
    this._updateLoginReturnUrl(activeRoute.urlAfterRedirects);
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
   * Updates the return url saved in the app state
   */
  private _updateLoginReturnUrl(url: string): void {
    this._authenticationService.updateLoginReturnUrl(url);
  }

  /**
   * Navigates to forbidden page
   */
  private _navigateToForbiddenPage() {
    this._loggerService.traceInfo(`ROUTE ACCESS DENIED!`);
    this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
  }

  /**
   * Navigates to not found page
   */
  private _navigateToNotFoundPage() {
    this._loggerService.traceInfo('FEATURE FLAG IS TURNED OFF!');
    this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
  }
}
