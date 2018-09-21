import {
  Observable,
  of
} from 'rxjs';
import {
  McsJob,
  McsApiSuccessResponse
} from '@app/models';

export const mockNotificationsService = {

  getNotifications(
    _page?: number,
    _perPage?: number,
    _searchKeyword?: string): Observable<McsApiSuccessResponse<McsJob[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array();

    let notification = new McsJob();
    notification.id = '4';
    mcsApiResponseMock.content.push(notification);
    notification = new McsJob();
    notification.id = '5';
    mcsApiResponseMock.content.push(notification);

    return of(mcsApiResponseMock);
  }
};
