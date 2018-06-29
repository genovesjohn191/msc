import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  finalize
} from 'rxjs/operators';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiConsole,
  McsLoggerService
} from '../../core';

@Injectable()
export class ConsolePageService {

  constructor(
    private _apiService: McsApiService,
    private _loggerService: McsLoggerService,
  ) { }

  /**
   * Get the server console for the commands to be executed
   * * Note: This will return the url of the console
   * @param id Server identification
   */
  public getServerConsole(id: any): Observable<McsApiSuccessResponse<McsApiConsole>> {
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
            .deserializeResponse<McsApiConsole>(McsApiConsole, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }
}
