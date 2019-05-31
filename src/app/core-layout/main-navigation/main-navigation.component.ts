import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CoreDefinition,
  CoreRoutes,
  McsAccessControlService
} from '@app/core';
import {
  RouteKey,
  RouteCategory,
  routeCategoryText,
  McsPermission,
  McsRouteInfo
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

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

  public constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControlService: McsAccessControlService
  ) { }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeHandler);
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
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
  public get hasHostingAccess(): boolean {
    return this._accessControlService.hasPermission([
      McsPermission.CloudVmAccess,
      McsPermission.DedicatedVmAccess,
      McsPermission.FirewallConfigurationView
    ]);
  }

  /**
   * Navigate to the given path key
   */
  public navigateTo(routeKey: RouteKey): void {
    if (isNullOrEmpty(routeKey)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(routeKey)]);
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
