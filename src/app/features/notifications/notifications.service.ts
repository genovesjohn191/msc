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
  reviverParser
} from '../../core/';

@Injectable()
export class NotificationsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   *
   * // TODO AP: get the actual notifications
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
      .catch((error: Response | any) => {
        let mcsApiErrorResponse: McsApiErrorResponse;

        if (error instanceof Response) {
          mcsApiErrorResponse = new McsApiErrorResponse();
          mcsApiErrorResponse.message = error.statusText;
          mcsApiErrorResponse.status = error.status;
        } else {
          mcsApiErrorResponse = error;
        }

        return Observable.throw(mcsApiErrorResponse);
      });
  }

  public getNotification(id: any): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/job/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let notificationsJobResponse: McsApiSuccessResponse<McsApiJob[]>;
        notificationsJobResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJob[]>;

        return notificationsJobResponse;
      })
      .catch((error: Response | any) => {
        let mcsApiErrorResponse: McsApiErrorResponse;

        if (error instanceof Response) {
          mcsApiErrorResponse = new McsApiErrorResponse();
          mcsApiErrorResponse.message = error.statusText;
          mcsApiErrorResponse.status = error.status;
        } else {
          mcsApiErrorResponse = error;
        }

        return Observable.throw(mcsApiErrorResponse);
      });
  }
}
