import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsStorageBackUpAggregationTarget,
  McsApiRequestParameter
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiStoragesService } from '../interfaces/mcs-api-storages.interface';

@Injectable()
export class McsApiStoragesService implements IMcsApiStoragesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  /**
   * Get all the backup aggregation targets
   */
  public getBackUpAggregationTargets(): Observable<McsApiSuccessResponse<McsStorageBackUpAggregationTarget[]>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = '/storage/backup/aggregation-targets';

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsStorageBackUpAggregationTarget[]>(
            McsStorageBackUpAggregationTarget, response
          );
        })
      );
  }
}
