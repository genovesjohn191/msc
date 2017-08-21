import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsApiSuccessResponse,
  McsApiJob,
  McsApiRequestParameter,
  McsJobType
} from '../../../core';
import {
  Server,
  ServerStorageDeviceUpdate,
  ServerPlatform
} from '../models';
import { reviverParser } from '../../../utilities';

export const mockServersService = {

  getServers(
    page?: number,
    perPage?: number,
    serverName?: string): Observable<McsApiSuccessResponse<Server[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Server[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array(new Server(), new Server());

    return Observable.of(mcsApiResponseMock);
  },
};
