import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsPortal
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiToolsService } from '../interfaces/mcs-api-tools.interface';

@Injectable()
export class McsApiToolsService implements IMcsApiToolsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get all the portals from the API
   */
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