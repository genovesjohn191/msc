import { Injector } from '@angular/core';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';
import { McsApiService } from '@app/services';

export class ServiceOsUpdatesInspectAction implements IServerServiceActionStrategy {

  private _apiService: McsApiService;
  public setInjector(_injector: Injector): void {
    this._apiService = _injector.get(McsApiService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): void {
    this._apiService.inspectServerForAvailableOsUpdates(
      serviceActionDetail.server.id,
      serviceActionDetail.payload
    ).subscribe();
  }
}
