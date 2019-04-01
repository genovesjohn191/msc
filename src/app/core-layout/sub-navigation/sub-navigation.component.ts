import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CoreEvent } from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSafely
} from '@app/utilities';
import {
  RouteKey,
  RouteCategory,
  McsRouteInfo
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';

@Component({
  selector: 'mcs-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'sub-navigation-wrapper'
  }
})

export class SubNavigationComponent implements OnInit, OnDestroy {
  public activeRouteCategory: RouteCategory;
  private _routeHandler: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService
  ) { }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeHandler);
  }

  /**
   * Returns the route category enumeration
   */
  public get routeCategoryEnum(): any {
    return RouteCategory;
  }

  /**
   * Returns the route key enumeration
   */
  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns true when the sub-navigation is displayed
   */
  public get showSubNavigation(): boolean {
    return !isNullOrEmpty(this.activeRouteCategory)
      && this.activeRouteCategory !== RouteCategory.None;
  }

  /**
   * Registers event handlers
   */
  private _registerEvents(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      CoreEvent.routeChange, this._onRouteChanged.bind(this));

    this._eventDispatcher.dispatch(CoreEvent.routeChange);
  }

  /**
   * Event that emits when the route has been changed
   * @param routeInfo Current route information
   */
  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    this.activeRouteCategory = routeInfo.enumCategory;
    this._changeDetectorRef.markForCheck();
  }
}
