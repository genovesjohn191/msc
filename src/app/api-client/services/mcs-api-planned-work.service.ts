import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isNullOrEmpty,
} from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsPlannedWork,
  McsPlannedWorkQueryParams,
  McsPlannedWorkAffectedService
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiPlannedWorkService } from '../interfaces/mcs-api-planned-work.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class McsApiPlannedWorkService implements IMcsApiPlannedWorkService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getPlannedWork(query?: McsPlannedWorkQueryParams): Observable<McsApiSuccessResponse<McsPlannedWork[]>> {
    if (isNullOrEmpty(query)) { query = new McsPlannedWorkQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/planned-work/';
    mcsApiRequestParameter.searchParameters = McsPlannedWorkQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsPlannedWork[]>(McsPlannedWork, response);
          return apiResponse;
        })
      );
  }

  public getPlannedWorkById(id: string): Observable<McsApiSuccessResponse<McsPlannedWork>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/planned-work/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsPlannedWork>(McsPlannedWork, response);
          return apiResponse;
        })
      );
  }

  public getPlannedWorkIcs(id: string): Observable<Blob> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/planned-work/${id}`;
    mcsApiRequestParameter.optionalHeaders = new Map<string, any>([
        ['Accept', 'text/calendar']
      ]);
    mcsApiRequestParameter.responseType = 'blob';

    return this._mcsApiService.get(mcsApiRequestParameter);
  }

  public getPlannedWorkAffectedServices(id: string, query?: McsPlannedWorkQueryParams):
    Observable<McsApiSuccessResponse<McsPlannedWorkAffectedService[]>>{
    if (isNullOrEmpty(query)) { query = new McsPlannedWorkQueryParams(); }
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/planned-work/${id}/affected-services`;
    mcsApiRequestParameter.searchParameters = McsPlannedWorkQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsPlannedWorkAffectedService[]>(McsPlannedWorkAffectedService, response);
          return apiResponse;
        })
      );
  }
}