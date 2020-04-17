import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsBackUpAggregationTarget,
  McsApiRequestParameter,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiStoragesService } from '../interfaces/mcs-api-storages.interface';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsApiStoragesService implements IMcsApiStoragesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  /**
   * Get all the backup aggregation targets
   */
  public getBackUpAggregationTargets(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsBackUpAggregationTarget[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/storage/backup/aggregation-targets`;
    requestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsBackUpAggregationTarget[]>(
            McsBackUpAggregationTarget, response
          );
        })
      );
  }

  /**
   * Get all the backup aggregation targets
   * @param id aggregation target identification
   */
  public getBackUpAggregationTarget(id: any): Observable<McsApiSuccessResponse<McsBackUpAggregationTarget>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/aggregation-targets/${id}`;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsBackUpAggregationTarget>(McsBackUpAggregationTarget, response);
          return apiResponse;
        })
      );
  }
}
