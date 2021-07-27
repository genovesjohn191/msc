import { Subscription } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreConfig,
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsRouteSettingsService
} from '@app/core';
import { McsAuthenticationService } from '@app/core/authentication/mcs-authentication.service';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  routeCategoryText,
  McsFeatureFlag,
  McsPermission,
  McsRouteInfo,
  RouteCategory,
  RouteKey
} from '@app/models';
import { RoutePlatform } from '@app/models/enumerations/route-platform.enum';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

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
  private _showLaunchPadMenu: boolean;
  private _showLaunchPadDashboardSubmenu: boolean;
  private _showLaunchPadNetworkDbSubmenu: boolean;
  private _showLaunchPadVlanDbSubmenu: boolean;
  private _showPrivateCloudMenu: boolean;
  private _showPublicCloudMenu: boolean;
  private _showComputeSubmenu: boolean;
  private _showNetworkSubmenu: boolean;
  private _showStorageSubmenu: boolean;
  private _showDashboardSubmenu: boolean;
  private _showAzureSubMenu: boolean;
  private _showOrdersMenu: boolean;

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  public get isAnonymous(): boolean {
    return this._authenticationIdentity.user?.isAnonymous;
  }

  public get showLaunchPadMenu(): boolean {
    return this._showLaunchPadMenu;
  }

  public get showLaunchPadDashboardSubmenu(): boolean {
    return this._showLaunchPadDashboardSubmenu;
  }

  public get showLaunchPadNetworkDbSubmenu(): boolean {
    return this._showLaunchPadNetworkDbSubmenu;
  }

  public get showLaunchPadVlanDbSubmenu(): boolean {
    return this._showLaunchPadVlanDbSubmenu;
  }

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

  public get showAzureSubMenu(): boolean {
    return this._showAzureSubMenu;
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
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService
  ) {
    this._updateOnCompanySwitch();
  }

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

    return hasPrivateAccess || hasPublicAccess;
  }

  public get isPrivateCloudRoute(): boolean {
    return this._routeSettingsService.isPrivateCloudRoute;
  }

  public get isPublicCloudRoute(): boolean {
    return this._routeSettingsService.isPublicCloudRoute;
  }

  public get hasLaunchPadAccess(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.LaunchPad]);
  }

  public get hasCrispAccess(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.Crisp]);
  }

  public get hasPrivateCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPrivateCloud;
  }

  public get hasPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud;
  }

  public get workflowReportingLink(): string {
    return this._authenticationIdentity.metadataLinks.find((link) => link.key === 'workflow_report')?.value;
  }

  public get catalogLinkText(): string {
    let hasSolutionCatalogAccess = this._accessControlService.hasAccessToFeature([McsFeatureFlag.CatalogSolutionListing]);
    if (hasSolutionCatalogAccess) {
      return this._translateService.instant(`navigation.productsAndSolutions`);
    }

    return this._translateService.instant(`navigation.catalog`);
  }

  public getCategoryLabel(routeCategory: RouteCategory): string {
    return routeCategoryText[routeCategory];
  }

  public toggleThis(propertyName: string): void {
    propertyName = '_' + propertyName;
    (this as any)[propertyName] = !((this)[propertyName] as boolean);
    this._changeDetectorRef.markForCheck();
  }

  public togglePublicCloud(propertyName: string): void {
    (this as any)[`_${propertyName}`] = !((this)[`_${propertyName}`] as boolean);
    (this as any)['_showDashboardSubmenu'] = !((this)['_showDashboardSubmenu'] as boolean);
    this._changeDetectorRef.markForCheck();
  }

  public logout(event: any): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  public login(event: any): void {
    event.preventDefault();
    this._authenticationService.logIn();
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
    this._initializeNavigation();

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets up the initial state of the navigation
   * and expands the current route
   */
  private _initializeNavigation(): void {
    this._initLaunchPadNav();
    this._initPrivateCloudNav();
    this._initPublicCloudNav();

    this._showOrdersMenu = (this._navInitialized && this._showOrdersMenu)
      ? this._showOrdersMenu
      : this._accessControlService.hasPermission([McsPermission.OrderView])
        && (this.selectedCategory === RouteCategory.Orders || this.selectedCategory === RouteCategory.MakeAChange);

    this._navInitialized = true;
  }

  private _initLaunchPadNav(): void {
    let isLaunchPadCategorySelected = this.hasLaunchPadAccess && (
      this.selectedCategory === RouteCategory.LaunchPad
      || this.selectedCategory === RouteCategory.LaunchPadNetworkDb
      || this.selectedCategory === RouteCategory.LaunchPadVlanDb
      || this.selectedCategory === RouteCategory.LaunchPadDashboard);

    this._showLaunchPadMenu = (this._navInitialized && this._showLaunchPadMenu)
      ? this._showLaunchPadMenu
      : isLaunchPadCategorySelected;

    this._showLaunchPadNetworkDbSubmenu = (this._navInitialized && this._showLaunchPadNetworkDbSubmenu)
      ? this._showLaunchPadNetworkDbSubmenu
      : this.selectedCategory === RouteCategory.LaunchPadNetworkDb || this.selectedCategory === RouteCategory.LaunchPadVlanDb;

    this._showLaunchPadVlanDbSubmenu = (this._navInitialized && this._showLaunchPadVlanDbSubmenu)
      ? this._showLaunchPadVlanDbSubmenu
      : this.selectedCategory === RouteCategory.LaunchPadVlanDb;

    this._showLaunchPadDashboardSubmenu = (this._navInitialized && this._showLaunchPadDashboardSubmenu)
      ? this._showLaunchPadDashboardSubmenu
      : this.selectedCategory === RouteCategory.LaunchPadDashboard;
  }

  private _initPrivateCloudNav(): void {
    this._showPrivateCloudMenu = (this._navInitialized && this._showPrivateCloudMenu)
    ? this._showPrivateCloudMenu
    : this.hasPrivateCloudAccess && this.isPrivateCloudRoute;

  this._showComputeSubmenu = (this._navInitialized && this._showComputeSubmenu)
    ? this._showComputeSubmenu
    : this.selectedCategory === RouteCategory.Compute;

  this._showNetworkSubmenu = (this._navInitialized && this._showNetworkSubmenu)
    ? this._showNetworkSubmenu
    : this.selectedCategory === RouteCategory.Network;

  this._showStorageSubmenu = (this._navInitialized && this._showStorageSubmenu)
    ? this._showStorageSubmenu
    : this.selectedCategory === RouteCategory.Storage;
  }

  private _initPublicCloudNav(): void {
    this._showPublicCloudMenu = (this._navInitialized && this._showPublicCloudMenu)
      ? this._showPublicCloudMenu
      : this.hasPrivateCloudAccess && this.isPublicCloudRoute;

    this._showDashboardSubmenu = (this._navInitialized && this._showDashboardSubmenu)
      ? this._showDashboardSubmenu
      : this.selectedCategory === RouteCategory.Dashboard;

    this._showAzureSubMenu = (this._navInitialized && this._showAzureSubMenu)
      ? this._showAzureSubMenu
      : this.selectedCategory === RouteCategory.Azure;
  }

  private _updateOnCompanySwitch(): void {
    this._eventDispatcher.addEventListener(McsEvent.accountChange, () => {
      this._changeDetectorRef.markForCheck()
    });
  }
}
