import { Injectable } from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsApiSuccessResponse,
  McsApiJob
} from '../../../core';
import {
  ServerThumbnail,
  ServerPlatform,
  ServerResource,
  ServerStorage,
  ServerNetwork
} from '../models';

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
  },
  getPlatformData() {
    let mcsApiResponseMock = new McsApiSuccessResponse<ServerPlatform>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = {
      platform: 'vcloud',
      environments: [
        {
          environment: 'Macquarie_Telecom_Contoso_100320',
          resources: [
            {
              name: 'M1VDC27117001',
              serviceType: 'Managed',
              availabilityZone: 'IC1',
              cpuAllocation: 10,
              cpuReservation: 2,
              cpuLimit: 10,
              memoryAllocationMB: 32768,
              memoryReservationMB: 6553,
              memoryLimitMB: 32768,
              storage: new Array<ServerStorage>(),
              networks: new Array<ServerNetwork>()
            }
          ]
        }
      ]
    };

    return Observable.of(mcsApiResponseMock);
  }
};
