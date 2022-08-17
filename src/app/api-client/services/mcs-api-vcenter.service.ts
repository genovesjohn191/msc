import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsJob,
  McsQueryParam,
  McsVCenterBaseline,
  McsVCenterBaselineQueryParam,
  McsVCenterBaselineRemediate,
  McsVCenterDataCentre,
  McsVCenterHost,
  McsVCenterHostQueryParam,
  McsVCenterInstance
} from '@app/models';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';

import { IMcsApiVCenterService } from '../interfaces/mcs-api-vcenter.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiVCenterService implements IMcsApiVCenterService {
  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getVCenterBaselines(query?: McsVCenterBaselineQueryParam): Observable<McsApiSuccessResponse<McsVCenterBaseline[]>> {
    if (isNullOrEmpty(query)) { query = new McsVCenterBaselineQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/vcenter/baselines';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = query.optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsVCenterBaseline[]>(McsVCenterBaseline, response);
        return apiResponse;
      })
    );
  }

  public getVCenterBaseline(id: any): Observable<McsApiSuccessResponse<McsVCenterBaseline>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/vcenter/baselines/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsVCenterBaseline>(McsVCenterBaseline, response);
          return apiResponse;
        })
      );
  }

  public remediateBaseline(id: string, request: McsVCenterBaselineRemediate): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/vcenter/baselines/${id}/remediate`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  public getVCenterInstances(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVCenterInstance[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/vcenter/instances';
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsVCenterInstance[]>(McsVCenterInstance, response);
        return apiResponse;
      })
    );
  }

  public getVCenterDataCentres(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVCenterDataCentre[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/vcenter/data-centres';
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsVCenterDataCentre[]>(McsVCenterDataCentre, response);
        return apiResponse;
      })
    );
  }

  public getVCenterHosts(query?: McsVCenterHostQueryParam): Observable<McsApiSuccessResponse<McsVCenterHost[]>> {
    if (isNullOrEmpty(query)) { query = new McsVCenterBaselineQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/vcenter/hosts';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = query.optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsVCenterHost[]>(McsVCenterHost, response);
        return apiResponse;
      })
    );
  }
}
