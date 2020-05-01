import { Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { McsApiService } from '@app/services';
import { McsJob } from '@app/models';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceOsUpdatesInspectAction implements IServerServiceActionStrategy<McsJob> {

  private _apiService: McsApiService;
  public setInjector(_injector: Injector): void {
    this._apiService = _injector.get(McsApiService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<McsJob> {
    return this._apiService.inspectServerForAvailableOsUpdates(
      serviceActionDetail.server.id,
      serviceActionDetail.payload
    );
  }
}
