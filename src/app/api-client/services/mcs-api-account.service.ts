import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsAccount
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAccountService } from '../interfaces/mcs-api-account.interface';

@Injectable()
export class McsApiAccountService implements IMcsApiAccountService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAccount(): Observable<McsApiSuccessResponse<McsAccount>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/account`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAccount>(
            McsAccount, response
        );
      })
    );
  }

  public getUser(username: string): Observable<McsApiSuccessResponse<McsAccount>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/account/users/${username}`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAccount>(
            McsAccount, response
          );
      })
    );
  }

  public getUsers(): Observable<McsApiSuccessResponse<McsAccount[]>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/account/users`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAccount[]>(
            McsAccount, response
          );
      })
    );
  }
}
