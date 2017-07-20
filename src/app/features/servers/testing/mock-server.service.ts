import { Injectable } from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsApiSuccessResponse,
  McsApiJob
} from '../../../core';
import { ServerThumbnail } from '../models';

export const mockServerService = {

  selectedServerStream: new Subject<any>(),
  setPerformanceScale(
    serverId: any,
    cpuSizeScale: any): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new McsApiJob();

    return Observable.of(mcsApiResponseMock);
  },
  getServerThumbnail(serverId: any) {
    return Observable.of({
      content: {
        file: 'aaaBBBcccDDD',
        fileType: 'image/png',
        encoding: 'base64'
      } as ServerThumbnail
    });
  }
};
