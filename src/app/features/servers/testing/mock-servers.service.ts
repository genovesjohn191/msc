import { Observable } from 'rxjs/Rx';
import { McsApiSuccessResponse } from '../../../core';
import {
  Server,
  ServerResource
} from '../models';

export const mockServersService = {

  getServers(
    _page?: number,
    _perPage?: number,
    _serverName?: string): Observable<McsApiSuccessResponse<Server[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Server[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new Server(), new Server());

    return Observable.of(mcsApiResponseMock);
  },
  getResources(): Observable<ServerResource[]> {
    let resources = new Array<ServerResource>();
    return Observable.of(resources);
  }
};
