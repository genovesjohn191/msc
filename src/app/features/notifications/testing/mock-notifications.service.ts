import { Observable } from 'rxjs/Rx';
import {
  McsApiJob,
  McsApiSuccessResponse
} from '../../../core';

export const mockNotificationsService = {

  getNotifications(
    _page?: number,
    _perPage?: number,
    _searchKeyword?: string): Observable<McsApiSuccessResponse<McsApiJob[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array();

    let notification = new McsApiJob();
    notification.id = '4';
    mcsApiResponseMock.content.push(notification);
    notification = new McsApiJob();
    notification.id = '5';
    mcsApiResponseMock.content.push(notification);

    return Observable.of(mcsApiResponseMock);
  }
};
