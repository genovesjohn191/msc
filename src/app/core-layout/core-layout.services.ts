import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsApiCompany,
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiErrorResponse
} from '../core';
import {
  convertJsonStringToObject,
  reviverParser
} from '../utilities';

@Injectable()
export class CoreLayoutService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get all the companies from the API
   */
  public getCompanies(): Observable<McsApiSuccessResponse<McsApiCompany[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/companies';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<McsApiCompany[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<McsApiCompany[]>>(
          response.text(),
          reviverParser
        );

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
