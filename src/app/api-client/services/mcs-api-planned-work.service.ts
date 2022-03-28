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
  McsPlannedWorkQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiPlannedWorkService } from '../interfaces/mcs-api-planned-work.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class McsApiPlannedWorkService implements IMcsApiPlannedWorkService {

  constructor(private _mcsApiService: McsApiClientHttpService, private _httpClient: HttpClient) { }

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


  public getPlannedWorkById(id: any): Observable<McsApiSuccessResponse<McsPlannedWork>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/planned-work/' + id;

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
}