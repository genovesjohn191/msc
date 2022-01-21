import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApplicationRecovery,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiApplicationRecoveryService } from '../interfaces/mcs-api-application-recovery.interface';

@Injectable()
export class McsApiApplicationRecoveryService implements IMcsApiApplicationRecoveryService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getApplicationRecovery(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsApplicationRecovery[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/hybrid-cloud/application-recovery';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsApplicationRecovery[]>(
            McsApplicationRecovery, response
        );
      })
    );
  }

  public getApplicationRecoveryById(id: string, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsApplicationRecovery>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/hybrid-cloud/application-recovery/${id}`;
    requestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsApplicationRecovery>(
            McsApplicationRecovery, response
          );
      })
    );
  }
}
