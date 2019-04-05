import { Injectable } from '@angular/core';
import {
  Router,
  RouteConfigLoadEnd,
  Route
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  Subscription,
  Subject
} from 'rxjs';
import {
  takeUntil,
  filter
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
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
import { McsLoggerService } from './mcs-logger.service';
import { McsErrorHandlerService } from './mcs-error-handler.service';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';
import { CoreEvent } from '../core.event';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { CoreRoutes } from '../core.routes';

@Injectable()
export class McsRouteSettingsService implements McsDisposable {
  private _routeHandler: Subscription;
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _titleService: Title,
    private _eventDispatcher: EventBusDispatcherService,
    private _errorHandlerService: McsErrorHandlerService,
    private _loggerService: McsLoggerService,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _authenticationService: McsAuthenticationService
  ) {
    this._initializeMainRoutes();
    this._initializeLazyRoutes();
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
      CoreEvent.routeChange, this._onRouteChanged.bind(this));
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

  /**
   * Initializes and reset the main routes configuration
   */
  private _initializeMainRoutes(): void {
    this._updateChildrenRoutePath(this._router.config);
  }

  /**
   * Initializes the lazy routes module (pre loaded modules)
   */
  private _initializeLazyRoutes(): void {
    this._router.events.pipe(
      takeUntil(this._destroySubject),
      filter((event) => event instanceof RouteConfigLoadEnd)
    ).subscribe((eventArgs: RouteConfigLoadEnd) => {

      // TODO: We need to find a way on how to update the
      // path of the lazy loaded elements because the corresponding event
      // in angular was not yet implement, so as of now we gonna use the microtasks.
      Promise.resolve().then(() => {
        let routes = getSafeProperty(eventArgs, (obj) => (obj.route as any)._loadedConfig.routes);
        this._updateChildrenRoutePath(routes);
      });
    });
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
