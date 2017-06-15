import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter,
  McsApiJob,
} from '../../../core';
import { reviverParser } from '../../../utilities';

@Injectable()
export class ProvisioningNotificationsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get all notifications from API
   * @param page Page to get all the jobs
   * @param perPage Count per page to obtain
   * @param searchKeyword keyword to determine which record to obtain
   */
  public getNotifications(
    page?: number,
    perPage?: number,
    searchKeyword?: string): Observable<McsApiSuccessResponse<McsApiJob[]>> {

    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let notificationsJobResponse: McsApiSuccessResponse<McsApiJob[]>;
        notificationsJobResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJob[]>;

        return notificationsJobResponse;
      })
      .catch(this._handleError);
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  private _handleError(error: Response | any) {
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
