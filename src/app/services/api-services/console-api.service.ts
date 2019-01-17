import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  finalize
} from 'rxjs/operators';
import {
  McsApiService,
  McsLoggerService
} from '@app/core';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsConsole,
} from '@app/models';

@Injectable()
export class ConsoleApiService {

  constructor(
    private _apiService: McsApiService,
    private _loggerService: McsLoggerService,
  ) { }

  /**
   * Get the server console for the commands to be executed
   * @param id Server identification
   */
  public getServerConsole(id: any): Observable<McsApiSuccessResponse<McsConsole>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/console`;

    return this._apiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsConsole>(McsConsole, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }
}
