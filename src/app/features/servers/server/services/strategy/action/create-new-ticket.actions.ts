import { Injector } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { RouteKey } from '@app/models';
import { McsNavigationService } from '@app/core';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceCreateNewTicketAction implements IServerServiceActionStrategy<void> {
  private _navigationService: McsNavigationService;

  public setInjector(injector: Injector): void {
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<void> {
    this._navigationService.navigateTo(RouteKey.TicketCreate, [], {
      queryParams: {serviceId: serviceActionDetail.server.serviceId  }
    });
    return of(undefined);
  }
}
