import {
  Router,
  NavigationEnd,
  ActivatedRoute
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Subject,
  BehaviorSubject
} from 'rxjs';
import {
  takeUntil,
  filter
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject,
  McsInitializer
} from '@app/utilities';
import {
  McsHttpStatusCode,
  McsRouteInfo
} from '@app/models';
import { CoreRoutes } from '../core.routes';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsLoggerService } from './mcs-logger.service';
import { McsErrorHandlerService } from './mcs-error-handler.service';

@Injectable()
export class McsRouteHandlerService implements McsInitializer {

  public onActiveRoute = new BehaviorSubject<McsRouteInfo>(undefined);

  private _activeRoute: McsRouteInfo;
  private _destroySubject = new Subject<void>();
  private _urlSubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _titleService: Title,
    private _loggerService: McsLoggerService,
    private _accessControlService: McsAccessControlService,
    private _authenticationService: McsAuthenticationService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  /**
   * Initializes all the router handler/guard events
   */
  public initialize(): void {
    this._loggerService.traceInfo(`Route checking initialized.`);
    this._router.events
      .pipe(
        takeUntil(this._destroySubject),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => this._setMainActiveRoute());
  }

  /**
   * Destroys all the resources
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
    unsubscribeSubject(this._urlSubject);
  }

  /**
   * Event that emits when the route has been navigated and
   * apply the corresponding settings on the route
   */
  private _applyRouteSettings() {
    this._validateRoutePermissions(this._activeRoute);
    this._validateRouteFeatureFlag(this._activeRoute);
    this._updateDocumentTitle(this._activeRoute);
    this._updateLoginReturnUrl();
  }

  /**
   * Sets the active main route based on the string url
   */
  private _setMainActiveRoute(): void {
    let activateRouteKey = this._activatedRoute.root;
    while (activateRouteKey.firstChild) {
      activateRouteKey = activateRouteKey.firstChild;
    }
    activateRouteKey.data.subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this._activeRoute = CoreRoutes.getRouteInfoByKey(+response.routeId);
      this.onActiveRoute.next(this._activeRoute);
      this._applyRouteSettings();
    });
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
   * Updates the return url saved in the app state
   */
  private _updateLoginReturnUrl(): void {
    this._authenticationService.updateLoginReturnUrl(this._router.url);
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
