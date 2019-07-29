import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/event-manager';
import {
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import { McsLoggerService } from './mcs-logger.service';

@Injectable()
export class McsSystemMessageHandlerService implements McsDisposable {

  private _routerHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _loggerService: McsLoggerService
  ) {
    this._registerEvents();
  }

  /**
   * Destroys all the resources
   */
  public dispose(): void {
    unsubscribeSafely(this._routerHandler);
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
  private _onRouteChange(): void {
    this._apiService.getActiveSystemMessages().pipe(
      map((response) => response.collection)
    ).subscribe((messages) => {
      this._loggerService.traceInfo(`Checking active messages...`);
      this._loggerService.traceInfo(`Active Messages:`, messages );
      /**
       * TODO: Check the type and severity of message
       * to determine the system message display
       */
      // if (!isNullOrEmpty(messages)) {
      //   activeMessage.severity === Severity.Critical ?
      //     this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessagePage)]) :
      //     this.display = SystemMessage.Banner;
      // }
    });
  }
}
