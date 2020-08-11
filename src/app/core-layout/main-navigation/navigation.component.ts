import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Injector
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsAccessControlService,
  McsRouteSettingsService,
  McsAuthenticationIdentity,
  CoreConfig
} from '@app/core';
import {
  RouteKey,
  RouteCategory,
  routeCategoryText,
  McsPermission,
  McsRouteInfo,
  McsFeatureFlag
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { RoutePlatform } from '@app/models/enumerations/route-platform.enum';
import { McsAuthenticationService } from '@app/core/authentication/mcs-authentication.service';

@Component({
  selector: 'mcs-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'main-navigation-wrapper'
  }
})

export class NavigationComponent implements OnInit, OnDestroy {
  public selectedCategory: RouteCategory;
  private _routeHandler: Subscription;
  private _navInitialized: boolean = false;
  private _showPrivateCloudMenu: boolean;
  private _showPublicCloudMenu: boolean;
  private _showComputeSubmenu: boolean;
  private _showNetworkSubmenu: boolean;
  private _showStorageSubmenu: boolean;
  private _showDashboardSubmenu: boolean;
  private _showOrdersMenu: boolean;

  public get showPrivateCloudMenu(): boolean {
    return this._showPrivateCloudMenu;
  }

  public get showPublicCloudMenu(): boolean {
    return this._showPublicCloudMenu;
  }

  public get showComputeSubmenu(): boolean {
    return this._showComputeSubmenu;
  }

  public get showNetworkSubmenu(): boolean {
    return this._showNetworkSubmenu;
  }

  public get showStorageSubmenu(): boolean {
    return this._showStorageSubmenu;
  }

  public get showOrdersMenu(): boolean {
    return this._showOrdersMenu;
  }

  public get showDashboardSubmenu(): boolean {
    return this._showDashboardSubmenu;
  }

  public get caretUpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_UP;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get routerPlatformEnum(): any {
    return RoutePlatform;
  }

  public get routerCategoryEnum(): any {
    return RouteCategory;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get macviewOrdersUrl(): string {
    return this._coreConfig.macviewOrdersUrl;
  }

  public constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _routeSettingsService: McsRouteSettingsService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService,
    private _coreConfig: CoreConfig
  ) { }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeHandler);
  }

  /**
   * Returns true when the user has hosting permission
   */
  public get hasDefaultPageAccess(): boolean {
    let hasPrivateAccess = this._accessControlService.hasPermission([
      McsPermission.CloudVmAccess,
      McsPermission.DedicatedVmAccess,
      McsPermission.FirewallConfigurationView
    ]);

    let hasPublicAccess = this._authenticationIdentity.platformSettings.hasPublicCloud;

    let hasProductCatalogAccess = this._accessControlService.hasAccessToFeature([
      McsFeatureFlag.ProductCatalog
    ]);
    let hasCatalogListingAccess = this._accessControlService.hasAccessToFeature([
      McsFeatureFlag.CatalogSolutionListing,
      McsFeatureFlag.CatalogProductListing
    ]);
    let hasCatalogAccess = hasProductCatalogAccess && hasCatalogListingAccess;

    return hasPrivateAccess || hasPublicAccess || hasCatalogAccess;
  }

  public get isPrivateCloudRoute(): boolean {
    return this._routeSettingsService.isPrivateCloudRoute;
  }

  public get isPublicCloudRoute(): boolean {
    return this._routeSettingsService.isPublicCloudRoute;
  }

  public get hasPrivateCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPrivateCloud;
  }

  public get hasPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud;
  }

  public getCategoryLabel(routeCategory: RouteCategory): string {
    return routeCategoryText[routeCategory];
  }

  public toggleThis(propertyName: string): void {
    propertyName = '_' + propertyName;
    (this as any)[propertyName] = !((this)[propertyName] as boolean);
    this._changeDetectorRef.markForCheck();
  }

  public logout(event: any): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));

    this._eventDispatcher.dispatch(McsEvent.routeChange);
  }

  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }

    this.selectedCategory = routeInfo.enumCategory;

    // Expands current route
    this.initializeNavigation();

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets up the initial state of the navigation
   * and expands the current route
   */
  private initializeNavigation() {
    this._showPrivateCloudMenu = (this._navInitialized && this._showPrivateCloudMenu)
      ? this._showPrivateCloudMenu
      : this.hasPrivateCloudAccess && this.isPrivateCloudRoute;

    this._showPublicCloudMenu = (this._navInitialized && this._showPublicCloudMenu)
      ? this._showPublicCloudMenu
      : this.hasPrivateCloudAccess && this.isPublicCloudRoute;

    this._showComputeSubmenu = (this._navInitialized && this._showComputeSubmenu)
      ? this._showComputeSubmenu
      : this.selectedCategory === RouteCategory.Compute;

    this._showNetworkSubmenu = (this._navInitialized && this._showNetworkSubmenu)
      ? this._showNetworkSubmenu
      : this.selectedCategory === RouteCategory.Network;

    this._showStorageSubmenu = (this._navInitialized && this._showStorageSubmenu)
      ? this._showStorageSubmenu
      : this.selectedCategory === RouteCategory.Storage;

    this._showDashboardSubmenu = (this._navInitialized && this._showDashboardSubmenu)
      ? this._showDashboardSubmenu
      : this.selectedCategory === RouteCategory.Dashboard;

    this._showOrdersMenu = (this._navInitialized && this._showOrdersMenu)
      ? this._showOrdersMenu
      : this._accessControlService.hasPermission([McsPermission.OrderView])
        && (this.selectedCategory === RouteCategory.Orders || this.selectedCategory === RouteCategory.MakeAChange);

    this._navInitialized = true;
  }
}