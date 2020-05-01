import { Injector } from '@angular/core';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';
import { McsApiService } from '@app/services';
import { McsJob } from '@app/models';
import { Observable } from 'rxjs';

export class ServiceOsUpdatesPatchAction implements IServerServiceActionStrategy<McsJob> {

  private _apiService: McsApiService;
  public setInjector(_injector: Injector): void {
    this._apiService = _injector.get(McsApiService);
  }

  public executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<McsJob> {
    return this._apiService.updateServerOs(serviceActionDetail.server.id, serviceActionDetail.payload);
  }
}
