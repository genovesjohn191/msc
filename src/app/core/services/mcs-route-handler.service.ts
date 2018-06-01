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
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsLoggerService } from '../services/mcs-logger.service';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';
import { McsTextContentProvider } from '../providers/mcs-text-content.provider';
import { McsRouteCategory } from '../enumerations/mcs-router-category.enum';
import { McsRouteDetails } from '../models/mcs-route-details';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';

@Injectable()
export class McsRouteHandlerService implements McsInitializer {

  public activeRoute: McsRouteDetails;
  public onActiveRoute = new BehaviorSubject<McsRouteDetails>(undefined);

  private _destroySubject = new Subject<void>();
  private _routeTable: Map<string, McsRouteDetails>;

  constructor(
    private _router: Router,
    private _titleService: Title,
    private _textContentProvider: McsTextContentProvider,
    private _loggerService: McsLoggerService,
    private _accessControlService: McsAccessControlService,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    this._routeTable = new Map();
  }

  /**
   * Initializes all the router handler/guard events
   */
  public initialize(): void {
    this._loggerService.traceInfo(`Route checking initialized.`);
    this._createRouteTable();

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
    this._setMainActiveRoute(navStart.urlAfterRedirects);
    this._guardRoutePermissions(this.activeRoute);
    this._updateDocumentTitle(this.activeRoute);
  }

  /**
   * Guards the route if it has permission, otherwise it will redirect to access denied page.
   */
  private _guardRoutePermissions(_activeRouteDetails: McsRouteDetails): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }
    this._loggerService.traceInfo(`Checking permission...`);
    this._loggerService.traceInfo(
      `Route Required Permissions: `,
      _activeRouteDetails.url,
      _activeRouteDetails.requiredPermissions);

    // Check user Permission
    if (!isNullOrEmpty(_activeRouteDetails.requiredPermissions)) {
      let hasRoutePermission = this._accessControlService
        .hasPermission(_activeRouteDetails.requiredPermissions);
      if (!hasRoutePermission) { this._navigateToForbiddenPage(); }
    }

    // Check feature Flag
    if (!isNullOrEmpty(_activeRouteDetails.featureFlag)) {
      let featureFlagIsEnabled = this._accessControlService
        .hasAccessToFeature(_activeRouteDetails.featureFlag);
      if (!featureFlagIsEnabled) { this._navigateToNotFoundPage(); }
    }
  }

  /**
   * Updates the currently displayed title based on category
   * @param _activeRouteDetails Active route details
   */
  private _updateDocumentTitle(_activeRouteDetails: McsRouteDetails): void {
    if (isNullOrEmpty(_activeRouteDetails)) { return; }
    this._loggerService.traceInfo(`Displaying title for ${_activeRouteDetails.url}`);
    this._titleService.setTitle(_activeRouteDetails.documentTitle);
  }

  /**
   * Sets the active route based on the string url
   * @param fullUrl The FullUrl to be set as active route
   */
  private _setMainActiveRoute(fullUrl: string): void {
    if (isNullOrEmpty(fullUrl)) { return; }

    // Find the key url based on the fullUrl
    let keyUrl: string;
    this._routeTable.forEach((_value, _key) => {
      let keyExist = fullUrl.includes(_key);
      if (!keyExist) { return; }
      keyUrl = _key;
    });
    if (isNullOrEmpty(keyUrl)) { keyUrl = fullUrl; }

    // Sets the main active url by key url
    let routeDetails = this._routeTable.get(keyUrl);
    if (isNullOrEmpty(routeDetails)) {
      routeDetails = new McsRouteDetails();
      routeDetails.category = McsRouteCategory.None;
      routeDetails.url = keyUrl;
      routeDetails.requiredPermissions = [];
    }
    this.activeRoute = routeDetails;
    this.onActiveRoute.next(routeDetails);
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

  /**
   * Creates route table based on url path
   */
  private _createRouteTable(): void {
    let documentTitleText = this._textContentProvider.content.documentTitle;

    // Register /servers endpoint
    this._routeTable.set('/servers',
      {
        category: McsRouteCategory.Compute, url: '/servers',
        documentTitle: documentTitleText.servers,
        requiredPermissions: ['VmAccess']
      });

    // Register /media endpoint
    this._routeTable.set('/medias',
      {
        category: McsRouteCategory.Compute, url: '/medias',
        documentTitle: documentTitleText.medias,
        requiredPermissions: [],
        featureFlag: 'enableMediaCatalog'
      });

    // Register /tickets endpoint
    this._routeTable.set('/tickets',
      {
        category: McsRouteCategory.None, url: '/tickets',
        documentTitle: documentTitleText.tickets,
        requiredPermissions: ['TicketView']
      });

    // Register /other tools endpoint
    this._routeTable.set('/tools',
      {
        category: McsRouteCategory.None, url: '/tools',
        documentTitle: documentTitleText.tools,
        requiredPermissions: []
      });

    // Register /products tools endpoint
    this._routeTable.set('/products',
      {
        category: McsRouteCategory.None, url: '/products',
        documentTitle: documentTitleText.products,
        requiredPermissions: [],
        featureFlag: 'enableProductCatalog'
      });

    // Register /notifications tools endpoint
    this._routeTable.set('/notifications',
      {
        category: McsRouteCategory.None, url: '/notifications',
        documentTitle: documentTitleText.notifications,
        requiredPermissions: []
      });

    // Register /networking/firewalls endpoint
    this._routeTable.set('/networking/firewalls',
      {
        category: McsRouteCategory.Network, url: '/networking/firewalls',
        documentTitle: documentTitleText.firewalls,
        requiredPermissions: ['FirewallConfigurationView']
      });
  }
}
