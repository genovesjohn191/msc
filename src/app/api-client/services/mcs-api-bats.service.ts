import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsBackUpAggregationTarget,
  McsApiRequestParameter,
  McsQueryParam,
  McsBatLinkedService
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiBatsService } from '../interfaces/mcs-api-bats.interface';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsApiBatsService implements IMcsApiBatsService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getBackUpAggregationTargets(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsBackUpAggregationTarget[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/aggregation-targets`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsBackUpAggregationTarget[]>(
            McsBackUpAggregationTarget, response
          );
        })
      );
  }

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

  public getBackUpAggregationTargetLinkedServices(id: any): Observable<McsApiSuccessResponse<McsBatLinkedService[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/aggregation-targets/${id}/linked-services`;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsBatLinkedService[]>(McsBatLinkedService, response);
          return apiResponse;
        })
      );
  }
}
