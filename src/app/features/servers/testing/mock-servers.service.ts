import {
  Observable,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  McsResource,
  McsServer
} from '@app/models';

export const mockServersService = {

  getServers(
    _page?: number,
    _perPage?: number,
    _serverName?: string): Observable<McsApiSuccessResponse<McsServer[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsServer[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new McsServer(), new McsServer());

    return of(mcsApiResponseMock);
  },
  getResources(): Observable<McsResource[]> {
    let resources = new Array<McsResource>();
    return of(resources);
  }
};
