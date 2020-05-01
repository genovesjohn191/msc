import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { McsApiService } from '@app/services';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceOsUpdatesScheduleDeleteAction implements IServerServiceActionStrategy<boolean> {

  private _apiService: McsApiService;
  public setInjector(_injector: Injector): void {
    this._apiService = _injector.get(McsApiService);
  }

  public executeEvent(_serviceActionDetail: ServerServiceActionDetail): Observable<boolean> {
    return this._apiService.deleteServerOsUpdatesSchedule(_serviceActionDetail.server.id);
  }
}
