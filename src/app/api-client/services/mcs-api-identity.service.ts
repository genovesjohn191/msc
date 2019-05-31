import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsIdentity
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiIdentityService } from '../interfaces/mcs-api-identity.interface';

@Injectable()
export class McsApiIdentityService implements IMcsApiIdentityService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get the user identity
   */
  public getIdentity(): Observable<McsApiSuccessResponse<McsIdentity>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/identity';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsIdentity>(McsIdentity, response);
          return apiResponse;
        })
      );
  }
}
