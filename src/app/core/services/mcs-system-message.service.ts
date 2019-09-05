import { Injectable } from '@angular/core';
import {
  Subscription,
  Observable,
  BehaviorSubject,
  Subject,
  empty
} from 'rxjs';
import {
  map,
  share,
  takeUntil,
  take,
  tap,
  filter,
  catchError
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsApiService } from '@app/services';
import {
  McsFeatureFlag,
  McsSystemMessage
} from '@app/models';
import { McsEvent } from '@app/events';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty,
  compareJsons,
  CommonDefinition
} from '@app/utilities';
import { RouteKey } from '@app/models';
import {
  LogClass,
  LogIgnore
} from '@peerlancers/ngx-logger';

import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsCookieService } from './mcs-cookie.service';
import { McsNavigationService } from './mcs-navigation.service';

@Injectable()
@LogClass()
export class McsSystemMessageService implements McsDisposable {

  private _activeMessageServiceReference: Observable<McsSystemMessage>;
  private _routerHandler: Subscription;
  private _destroySubject: Subject<void>;
  private _activeMessageChange: BehaviorSubject<McsSystemMessage>;

  constructor(
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _cookieService: McsCookieService
  ) {
    this._activeMessageChange = new BehaviorSubject<McsSystemMessage>(null);
    this._destroySubject = new Subject();
    this._registerEvents();
    this._registerActiveSystemMessageService();
  }

  /**
   * Destroys all the resources
   */
  public dispose(): void {
    unsubscribeSafely(this._routerHandler);
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * System Message Observable emitted once active message changes
   */
  public activeMessage(): Observable<McsSystemMessage> {
    return this._activeMessageChange.asObservable().pipe(take(1));
  }

  /**
   * Registers active system message service
   */
  public _registerActiveSystemMessageService() {
    this._activeMessageServiceReference = this._apiService.getActiveSystemMessages().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection[0])),
      catchError(() => empty()),
      share()
    );

    this._activeMessageChange.pipe(
      filter((response) => !isNullOrEmpty(response)),
      tap(() => this._navigationService.navigateTo(RouteKey.SystemMessagePage, [], { skipLocationChange: true })),
      takeUntil(this._destroySubject),
    ).subscribe();
  }

  /**
   * Registers the event handlers
   */
  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChange.bind(this)
    );
  }

  /**
   * Event that gets notified once there are changes on the route
   */
  @LogIgnore()
  private _onRouteChange(): void {
    let hasSystemMessageFeatureFlag = this._accessControlService.hasAccessToFeature(McsFeatureFlag.SystemMessages);
    if (!hasSystemMessageFeatureFlag) { return; }

    this._activeMessageServiceReference.subscribe((message) => {
      if (isNullOrEmpty(message) || !message.isCritical) { return; }

      let activeSystemMessageCookie = this._cookieService.getEncryptedItem<McsSystemMessage>(
        CommonDefinition.COOKIE_ACTIVE_MESSAGE
      );

      let comparisonOutput = compareJsons(message, activeSystemMessageCookie);
      if (comparisonOutput === 0) { return; }

      this._activeMessageChange.next(message);
    });
  }
}
