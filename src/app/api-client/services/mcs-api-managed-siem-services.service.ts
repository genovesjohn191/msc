import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsManagedSiemService
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiManagedSiemService } from '../interfaces/mcs-api-managed-siem-services.interface';

@Injectable()
export class McsApiManagedSiemService implements IMcsApiManagedSiemService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getManagedSiemServices(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsManagedSiemService[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/managed-security/managed-siem';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsManagedSiemService[]>(
            McsManagedSiemService, response
        );
      })
    );
  }
}
