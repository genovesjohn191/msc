import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  Subscription,
  Subject
} from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsRouteInfo,
  HttpStatusCode
} from '@app/models';
import {
  isNullOrEmpty,
  McsDisposable,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { McsEvent } from '@app/events';
import { LogClass } from '@peerlancers/ngx-logger';

import { McsErrorHandlerService } from './mcs-error-handler.service';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { CoreRoutes } from '../core.routes';

@Injectable()
@LogClass()
export class McsRouteSettingsService implements McsDisposable {
  private _routeHandler: Subscription;
  private _destroySubject = new Subject<void>();

  constructor(
    private _titleService: Title,
    private _eventDispatcher: EventBusDispatcherService,
    private _errorHandlerService: McsErrorHandlerService,
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
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Registers all the events
   */
  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));
  }

  /**
   * Event that emits when the route has been changed
   * @param routeInfo Route to be emitted
   */
  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }

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
    this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
  }

  /**
   * Navigates to not found page
   */
  private _navigateToNotFoundPage() {
    this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
  }

  /**
   * Updates the children route path
   * @param children Children routes to be updated
   */
  private _updateChildrenRoutePath(children: Route[]): void {
    if (isNullOrEmpty(children)) { return; }
    children.forEach((child) => {
      this._updateChildrenRoutePath(child.children);
      this._updateRoutePath(child);
    });
  }

  /**
   * Updates the route path of the given route
   * @param route Route to be updated
   */
  private _updateRoutePath(route: Route): void {
    if (isNullOrEmpty(route)) { return; }

    let routeId = getSafeProperty(route, (obj) => obj.data.routeId);
    if (!isNullOrEmpty(routeId)) {
      let dynamicPath = CoreRoutes.getRoutePath(routeId);

      isNullOrEmpty(route.pathMatch) ?
        route.path = dynamicPath :
        route.redirectTo = dynamicPath;
    }
  }
}
