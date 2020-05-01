import { Injector } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { RouteKey } from '@app/models';
import { McsNavigationService } from '@app/core';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class RaiseInviewLevelAction implements IServerServiceActionStrategy<void> {


  private _navigationService: McsNavigationService;
  private _eventDispatcher: EventBusDispatcherService;

  public setInjector(injector: Injector): void {
    this._eventDispatcher = injector.get(EventBusDispatcherService);
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<void> {
    this._eventDispatcher.dispatch(McsEvent.serverRaiseInviewSelected, serviceActionDetail.server);
    this._navigationService.navigateTo(RouteKey.OrderServiceInviewRaise);
    return of(undefined);
  }
}
