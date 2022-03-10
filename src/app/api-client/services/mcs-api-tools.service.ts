import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsPortal,
  McsQueryParam
} from '@app/models';

import { IMcsApiToolsService } from '../interfaces/mcs-api-tools.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsApiToolsService implements IMcsApiToolsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getPortals(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsPortal[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/portals';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsPortal[]>(McsPortal, response);
          return apiResponse;
        })
      );
  }
}
