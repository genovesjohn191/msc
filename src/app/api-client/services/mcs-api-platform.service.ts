import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsPlatform
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiPlatformService } from '../interfaces/mcs-api-platform.interface';

@Injectable()
export class McsApiPlatformService implements IMcsApiPlatformService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get platform settings from API
   */
  public getPlatform(): Observable<McsApiSuccessResponse<McsPlatform>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/platform`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsPlatform>(McsPlatform, response);
          return apiResponse;
        })
      );
  }
}
