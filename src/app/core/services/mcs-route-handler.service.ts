import {
  Subject,
  Subscription
} from 'rxjs';
import {
  filter,
  takeUntil
} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router
} from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsIdentity,
  RouteKey
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import {
  LogClass,
  LogIgnore
} from '@peerlancers/ngx-logger';

import { CoreRoutes } from '../core.routes';

@Injectable()
@LogClass()
export class McsRouteHandlerService implements McsDisposable {
  private _userHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _urlSubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._registerEvents();
  }

  /**
   * Destroys all the resources
   */
  public dispose(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._urlSubject);
    unsubscribeSafely(this._userHandler);
  }

  /**
   * Registers the event handlers
   */
  private _registerEvents(): void {
    this._userHandler = this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));
  }

  /**
   * Event that emits when the user has been changed
   * @param user User to be emitted
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }

    this._router.events.pipe(
      takeUntil(this._destroySubject),
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((eventArgs) => {
      this._setMainActiveRoute(eventArgs as NavigationEnd);
    });
  }

  /**
   * Sets the main active route configuration
   * @param routeArgs Router navigation options
   */
  private _setMainActiveRoute(routeArgs: NavigationEnd): void {
    let routeId: RouteKey;
    this._activatedRoute.snapshot.children.forEach((activatedChild) => {
      let currentActiveRoute = this._getCurrentActiveRoute(activatedChild.children);
      routeId = this._getRouteIdBySnapshot(currentActiveRoute);
    });
    if (isNullOrEmpty(routeId)) { return; }

    let activeRoute = CoreRoutes.getRouteInfoByKey(routeId);
    activeRoute.urlAfterRedirects = routeArgs.urlAfterRedirects;
    this._eventDispatcher.dispatch(McsEvent.routeChange, activeRoute);
  }

  /**
   * Gets the current active route based on the snapshots
   * @param activeRoutes Active routes that have children
   */
  @LogIgnore()
  private _getCurrentActiveRoute(activeRoutes: ActivatedRouteSnapshot[]): ActivatedRouteSnapshot {
    if (isNullOrEmpty(activeRoutes)) { return null; }
    let activeRoute: ActivatedRouteSnapshot;

    activeRoutes.forEach((currentRoute) => {
      activeRoute = isNullOrEmpty(currentRoute.children) ?
        currentRoute : this._getCurrentActiveRoute(currentRoute.children);
    });
    return activeRoute;
  }

  /**
   * Gets the route id based on the activated snapshot
   * @param snapshot Activated snapshot on where to get the routeId
   */
  private _getRouteIdBySnapshot(snapshot: ActivatedRouteSnapshot): number {
    if (isNullOrEmpty(snapshot)) { return null; }
    return getSafeProperty(snapshot, (obj) => +obj.data.routeId);
  }
}
