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
  McsNavigationService,
  McsRouteSettingsService,
  McsAuthenticationIdentity
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
import { MenuRouteContext } from './strategy/menu-route.context';
import { RoutePlatform } from '@app/models/enumerations/route-platform.enum';

@Component({
  selector: 'mcs-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'main-navigation-wrapper'
  }
})

export class MainNavigationComponent implements OnInit, OnDestroy {
  public selectedCategory: RouteCategory;
  private _routeHandler: Subscription;
  private _menuRouteContext: MenuRouteContext;

  public constructor(
    _injector: Injector,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _routeSettingsService: McsRouteSettingsService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    this._menuRouteContext = new MenuRouteContext(_injector);
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeHandler);
  }

  public get caretRightIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_RIGHT;
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

  /**
   * Navigate to the given path key
   */
  public navigateTo(routeKey: RouteKey): void {
    if (isNullOrEmpty(routeKey)) { return; }
    this._navigationService.navigateTo(routeKey);
  }

  /**
   * Navigate to the default route of the Category
   */
  public navigateToRouteCategoryDefault(routeCategory: RouteCategory): void {
    if (isNullOrEmpty(routeCategory)) { return; }
    this._menuRouteContext.setRouteCategory(routeCategory);
    this._menuRouteContext.navigateToDefaultMenu();
  }

  /**
   * Returns the route category label
   * @param routeCategory Route category to obtain
   */
  public getCategoryLabel(routeCategory: RouteCategory): string {
    return routeCategoryText[routeCategory];
  }

  /**
   * Registers event handlers
   */
  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));

    this._eventDispatcher.dispatch(McsEvent.routeChange);
  }

  /**
   * Event that emits when the route has been changed
   * @param routeInfo Current route information
   */
  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }

    this.selectedCategory = routeInfo.enumCategory;
    this._changeDetectorRef.markForCheck();
  }
}
