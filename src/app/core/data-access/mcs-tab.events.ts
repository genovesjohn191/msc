import {
  shareReplay,
  takeUntil,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';

import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsRouteInfo } from '@app/models';
import {
  getSafeProperty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

export class McsTabEvents implements McsDisposable {
  public selectedTabId$: Observable<string>;

  private readonly eventDispatcher: EventBusDispatcherService;
  private readonly destroySubject: Subject<void>;

  private _routeHandler: Subscription;
  private _selectedTabChange: BehaviorSubject<string>;

  constructor(injector: Injector) {
    this.eventDispatcher = injector.get<EventBusDispatcherService>(EventBusDispatcherService);

    this.destroySubject = new Subject<void>();
    this._selectedTabChange = new BehaviorSubject(null);
  }

  public initialize(): void {
    this._routeHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this._selectedTabChange.next(tabUrl);
      });

    this.selectedTabId$ = this._selectedTabChange.pipe(
      takeUntil(this.destroySubject),
      shareReplay(1)
    );
  }

  public dispose(): void {
    unsubscribeSafely(this.destroySubject);
    unsubscribeSafely(this._routeHandler);
  }
}
