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
  McsLicense,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiLicensesService } from '../interfaces/mcs-api-licenses.interface';

/**
 * Licenses Services Class
 */
@Injectable()
export class McsApiLicensesService implements IMcsApiLicensesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getLicenses(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsLicense[]>> {

    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/licenses';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsLicense[]>(McsLicense, response);
          return apiResponse;
        })
      );
  }

  public getLicense(id: any): Observable<McsApiSuccessResponse<McsLicense>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/licenses/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsLicense>(McsLicense, response);
          return apiResponse;
        })
      );
  }
}
