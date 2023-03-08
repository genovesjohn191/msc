import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsPerpetualSoftware
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiPerpetualSoftwareService } from '../interfaces/mcs-api-perpetual-software.interface';

@Injectable()
export class McsApiPerpetualSoftwareService implements IMcsApiPerpetualSoftwareService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzurePerpetualSoftware(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsPerpetualSoftware[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/perpetual-software';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsPerpetualSoftware[]>(
            McsPerpetualSoftware, response
        );
      })
    );
  }
}