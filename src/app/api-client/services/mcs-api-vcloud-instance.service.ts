import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsVcloudInstance,
  McsVcloudInstanceProviderVdc,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiVcloudInstanceService } from '../interfaces/mcs-api-vcloud-instance.interface';

/**
 * VM Size Services Class
 */
@Injectable()
export class McsApiVcloudInstanceService implements IMcsApiVcloudInstanceService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getVcloudInstances(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsVcloudInstance[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/vcloud-instances';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsVcloudInstance[]>(McsVcloudInstance, response);
          return apiResponse;
        })
      );
  }

  public getVcloudInstanceProviderVdc(
    id: string,
    isDedicated: boolean,
    optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVcloudInstanceProviderVdc[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();

    mcsApiRequestParameter.endPoint = `/private-cloud/vcloud-instances/${id}/provider-vdcs?isDedicated=${isDedicated}`;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsVcloudInstanceProviderVdc[]>(McsVcloudInstanceProviderVdc, response);
          return apiResponse;
        })
      );
  }
}
