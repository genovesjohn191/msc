import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsConsole,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiConsoleService } from '../interfaces/mcs-api-console.interface';

@Injectable()
export class McsApiConsoleService implements IMcsApiConsoleService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get the server console for the commands to be executed
   * @param id Server identification
   */
  public getServerConsole(id: string): Observable<McsApiSuccessResponse<McsConsole>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/console`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsConsole>(McsConsole, response);
          return apiResponse;
        })
      );
  }
}
