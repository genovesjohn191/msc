import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { McsApiSuccessResponse } from '../../../core';
import { Server } from '../models';

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
  }
};
