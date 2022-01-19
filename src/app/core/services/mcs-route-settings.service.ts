import {
  Subject,
  Subscription
} from 'rxjs';

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  HttpStatusCode,
  McsRouteInfo,
  RoutePlatform
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import { LogClass } from '@peerlancers/ngx-logger';

import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsErrorHandlerService } from './mcs-error-handler.service';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';

@Injectable()
@LogClass()
export class McsRouteSettingsService implements McsDisposable {
  private _routeHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _selectedPlatform: RoutePlatform;

  constructor(
    private _titleService: Title,
    private _eventDispatcher: EventBusDispatcherService,
    private _errorHandlerService: McsErrorHandlerService,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _authenticationService: McsAuthenticationService,
    private _identity: McsAuthenticationIdentity
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

  public get selectedPlatform(): RoutePlatform {
    return this._selectedPlatform;
  }

  public set selectedPlatform(value: RoutePlatform) {
    this._selectedPlatform = value;
  }

  public get hasPrivateCloudPlatform(): boolean {
    return this._identity.platformSettings.hasPrivateCloud;
  }

  public get hasPublicCloudPlatform(): boolean {
    return this._identity.platformSettings.hasPublicCloud;
  }

  public get hasHybridCloudPlatform(): boolean {
    return this._identity.platformSettings.hasHybridCloud;
  }

  public get isPrivateCloudRoute(): boolean {
    return this.selectedPlatform === RoutePlatform.Private;
  }

  public get isPublicCloudRoute(): boolean {
    return this.selectedPlatform === RoutePlatform.Public;
  }

  public get isHybridCloudRoute(): boolean {
    return this.selectedPlatform === RoutePlatform.Hybrid;
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
    this._determineCurrentPlatform(activeRoute);
    this._validateRoutePermissions(activeRoute);
    this._validateRouteFeatureFlag(activeRoute);
    this._updateDocumentTitle(activeRoute);
    this._updateLoginReturnUrl(activeRoute.urlAfterRedirects);
  }

  /**
   * Identify current platform (Private, Public, Global) based on page route
   */
  private _determineCurrentPlatform(routeInfo: McsRouteInfo) {
    if (!this._hasPlatformAccess(routeInfo)) { return; }

    this._selectedPlatform = routeInfo.enumPlatform;
  }

  /**
   * Check for platform access using platform settings from Identity
   */
  private _hasPlatformAccess(activeRouteDetails: McsRouteInfo): boolean {
    let globallyAccessibleRoutePlatform: boolean =
      isNullOrEmpty(activeRouteDetails.enumPlatform) || activeRouteDetails.enumPlatform === RoutePlatform.Global;
    if (globallyAccessibleRoutePlatform) { return true; }

    let hasAccessToActivePublicCloudRoute: boolean =
      activeRouteDetails.enumPlatform === RoutePlatform.Public && this._identity.platformSettings.hasPublicCloud;
    let hasAccessToActivePrivateCloudRoute: boolean =
      activeRouteDetails.enumPlatform === RoutePlatform.Private && this._identity.platformSettings.hasPrivateCloud;
    let hasAccessToActiveHybridCloudRoute: boolean =
      activeRouteDetails.enumPlatform === RoutePlatform.Hybrid && this._identity.platformSettings.hasHybridCloud;

    let hasAccessToTargetPlatform = hasAccessToActivePublicCloudRoute ||
        hasAccessToActivePrivateCloudRoute ||
        hasAccessToActiveHybridCloudRoute;

    if (hasAccessToTargetPlatform) {
      return true;
    }

    this._navigateToNotFoundPage();
    return false;
  }

  /**
   * Validates the current route based on its permissions,
   * and navigate to not forbidden page instead
   */
  private _validateRoutePermissions(_activeRouteDetails: McsRouteInfo): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }

    if (!isNullOrEmpty(_activeRouteDetails.requiredPermissions)) {
      let hasRoutePermission = this._accessControlService
        .hasPermission(_activeRouteDetails.requiredPermissions, _activeRouteDetails.requreAllPermissions);
      if (!hasRoutePermission) { this._navigateToForbiddenPage(); }
    }
  }

  /**
   * Validates the current route based on its feature flag,
   * and navigate to not found page instead
   */
  private _validateRouteFeatureFlag(_activeRouteDetails: McsRouteInfo): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }

    if (!isNullOrEmpty(_activeRouteDetails.requiredFeatureFlags)) {
      let featureFlagIsEnabled = this._accessControlService
        .hasAccessToFeature(_activeRouteDetails.requiredFeatureFlags, _activeRouteDetails.requireAllFeatures);
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
}
