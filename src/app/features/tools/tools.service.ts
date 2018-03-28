import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsLoggerService
} from '../../core';
import { Portal } from './models';

@Injectable()
export class ToolsService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService
  ) { }

  /**
   * Get all the portals from the API
   */
  public getPortals(): Observable<McsApiSuccessResponse<Portal[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/portals';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<Portal[]>(Portal, response);

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }
}
