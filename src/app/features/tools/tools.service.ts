import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { convertJsonStringToObject } from '../../utilities';

// Services Declarations
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter
} from '../../core';
import { Portal } from './portal';

@Injectable()
export class ToolsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get all the portals from the API
   */
  public getPortals(): Observable<McsApiSuccessResponse<Portal[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/portals';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<Portal[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<Portal[]>>(response);

        return apiResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will handle all error that correspond to HTTP request
   * @param error Error obtained
   */
  private _handleServerError(error: Response | any) {
    let mcsApiErrorResponse: McsApiErrorResponse;

    if (error instanceof Response) {
      mcsApiErrorResponse = new McsApiErrorResponse();
      mcsApiErrorResponse.message = error.statusText;
      mcsApiErrorResponse.status = error.status;
    } else {
      mcsApiErrorResponse = error;
    }

    return Observable.throw(mcsApiErrorResponse);
  }
}
