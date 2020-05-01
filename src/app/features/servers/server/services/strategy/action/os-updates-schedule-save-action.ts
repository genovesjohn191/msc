import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { McsApiService } from '@app/services';
import { McsServerOsUpdatesSchedule } from '@app/models';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceOsUpdatesScheduleSaveAction implements IServerServiceActionStrategy<McsServerOsUpdatesSchedule> {

  private _apiService: McsApiService;
  public setInjector(_injector: Injector): void {
    this._apiService = _injector.get(McsApiService);
  }

  public executeEvent(_serviceActionDetail: ServerServiceActionDetail): Observable<McsServerOsUpdatesSchedule> {
    return this._apiService.deleteServerOsUpdatesSchedule(_serviceActionDetail.server.id).pipe(
      concatMap(() => this._apiService.updateServerOsUpdatesSchedule(_serviceActionDetail.server.id, _serviceActionDetail.payload))
    );
  }
}
