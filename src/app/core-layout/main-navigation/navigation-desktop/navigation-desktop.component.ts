import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  CoreConfig
} from '@app/core';
import {
  RouteKey,
  McsRouteInfo,
  RouteCategory
} from '@app/models';
import {
  CommonDefinition,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationDesktopComponent implements OnInit, OnDestroy {

  public selectedCategory: RouteCategory;

  public get arrowUpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get routerCategoryEnum(): any {
    return RouteCategory;
  }

  /**
   * Returns the macquarie view url
   */
  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }

  private _routeChangeHandler: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _coreConfig: CoreConfig) { }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeChangeHandler);
  }

  /**
   * Register events state
   */
  private _registerEvents(): void {
    this._routeChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this)
    );
    this._eventDispatcher.dispatch(McsEvent.routeChange);
  }

  /**
   * Events that gets notified when route has been changed
   */
  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }
    this.selectedCategory = routeInfo.enumCategory;
    this._changeDetectorRef.markForCheck();
  }
}
