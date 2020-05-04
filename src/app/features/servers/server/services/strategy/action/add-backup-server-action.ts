import { Injector } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsNavigationService } from '@app/core';
import { McsEvent } from '@app/events';
import { RouteKey } from '@app/models';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceAddBackupServerAction implements IServerServiceActionStrategy<void> {
  private _navigationService: McsNavigationService;
  private _eventDispatcher: EventBusDispatcherService;

  public setInjector(injector: Injector): void {
    this._eventDispatcher = injector.get(EventBusDispatcherService);
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<void> {
    this._eventDispatcher.dispatch(McsEvent.serverAddBackupServerSelected, serviceActionDetail.server);
    this._navigationService.navigateTo(RouteKey.OrderAddServerBackup);
    return of(undefined);
  }
}
