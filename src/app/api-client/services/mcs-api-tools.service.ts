import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsPortal
} from '@app/models';

import { IMcsApiToolsService } from '../interfaces/mcs-api-tools.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiToolsService implements IMcsApiToolsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getPortals(): Observable<McsApiSuccessResponse<McsPortal[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/portals';

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
