import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAuthService } from '../interfaces/mcs-api-auth.interface';

@Injectable()
export class McsApiAuthService implements IMcsApiAuthService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public extendSession(): Observable<McsApiSuccessResponse<string>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/auth/extend`;

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<string>(String, response);
          return apiResponse;
        })
      );
  }
}
