import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiJob,
} from '../../core';
import {
  reviverParser,
  isNullOrEmpty
} from '../../utilities';

@Injectable()
export class NotificationsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get Notifications (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param serverName Server name filter
   */
  public getNotifications(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }): Observable<McsApiSuccessResponse<McsApiJob[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let notificationsJobResponse: McsApiSuccessResponse<McsApiJob[]>;
        notificationsJobResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob[]>;

        return notificationsJobResponse;
      });
  }

  /**
   * Get notification by ID (MCS API Response)
   * @param id Notification identification
   */
  public getNotification(id: any): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/job/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let notificationsJobResponse: McsApiSuccessResponse<McsApiJob>;
        notificationsJobResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return notificationsJobResponse;
      });
  }
}
