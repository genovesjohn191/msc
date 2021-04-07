import {
  of,
  Observable
} from 'rxjs';

import { Injector } from '@angular/core';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { RouteKey } from '@app/models';

import { ServerServiceActionDetail } from '../server-service-action.context';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';

export class ServiceAddHidsAction implements IServerServiceActionStrategy<void> {
  private _navigationService: McsNavigationService;
  private _eventDispatcher: EventBusDispatcherService;

  public setInjector(injector: Injector): void {
    this._eventDispatcher = injector.get(EventBusDispatcherService);
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<void> {
    this._eventDispatcher.dispatch(McsEvent.serverAddHidsSelected, serviceActionDetail.server);
    this._navigationService.navigateTo(RouteKey.OrderAddHids);
    return of(undefined);
  }
}
