import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter,
  McsApiConsole
} from '../../core';

@Injectable()
export class ConsoleService {

  constructor(private _apiService: McsApiService) {
    // Get User ID from AppState
  }

  /**
   * Get the server console for the commands to be executed
   * * Note: This will return the url of the console
   * @param id Server identification
   */
  public getServerConsole(id: any): Observable<McsApiSuccessResponse<McsApiConsole>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/console`;

    return this._apiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiConsole>;
        serverResponse = JSON.parse(response.text()) as McsApiSuccessResponse<McsApiConsole>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

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
