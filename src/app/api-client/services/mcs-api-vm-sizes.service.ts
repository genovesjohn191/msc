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
  McsVmSize,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiVmSizesService } from '../interfaces/mcs-api-vm-sizes.interface';
import { HttpClient } from '@angular/common/http';

/**
 * VM Size Services Class
 */
@Injectable()
export class McsApiVMSizesService implements IMcsApiVmSizesService {

  constructor(private _mcsApiService: McsApiClientHttpService, private httpClient: HttpClient) { }

  public getVmSizes(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsVmSize[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/vm-sizes';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    let url = '../../../assets/mock-data/vm-size.json';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsVmSize[]>(McsVmSize, response);
          return apiResponse;
        })
      );
  }

  public getVmSize(id: string): Observable<McsApiSuccessResponse<McsVmSize>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/vm-sizes/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsVmSize>(McsVmSize, response);
          return apiResponse;
        })
      );
  }
}
