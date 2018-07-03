import {
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  McsApiJob,
  McsJobType,
  McsJobStatus
} from '../../../core';
import { Resource } from '../../resources';
import {
  Server,
  ServerPowerState,
  ServerThumbnail,
  ServerServiceType,
  ServerStorageDeviceUpdate,
  ServerCreateNic
} from '../models';

export const mockServerService = {

  selectedServerStream: new Subject<any>(),
  getServer(_id: any): Observable<McsApiSuccessResponse<Server>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Server>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = {
      id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      name: 'contoso-lin01',
      platform: {
        environmentName: 'Macquarie_Telecom_Contoso_100320',
        resourceName: 'M1VDC27117001'
      },
      serviceType: ServerServiceType.Managed,
      powerState: ServerPowerState.PoweredOn,
    } as Server;

    return of(mcsApiResponseMock);
  },
  setSelectedServer(server: Server) {
    this.selectedServerStream.next(server);
  },
  setPerformanceScale(
    _serverId: any,
    _cpuSizeScale: any): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new McsApiJob();

    return of(mcsApiResponseMock);
  },
  getServerThumbnail(_serverId: any) {
    return of({
      content: {
        file: 'aaaBBBcccDDD',
        fileType: 'image/png',
        encoding: 'base64'
      } as ServerThumbnail
    });
  },

  getServerResources() {
    let mcsApiResponseMock = new McsApiSuccessResponse<Resource[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array<Resource>();

    return of(mcsApiResponseMock);
  },
  createServerStorage(
    _serverId: any,
    _storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.CreateServerDisk;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      storageProfile: 'T2000-PVDC0301',
      sizeMB: 2048
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  updateServerStorage(
    _serverId: any,
    _storageId: any,
    _storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.UpdateServerDisk;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      diskId: '1d6d55d7-0b02-4341-9359-2e4bc783d9b1'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  deleteServerStorage(
    _serverId: any,
    _storageId: any
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.UpdateServerDisk;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      diskId: '1d6d55d7-0b02-4341-9359-2e4bc783d9b1'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  addServerNetwork(
    _serverId: any,
    _networkData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.CreateServerNic;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      networkName: 'Customer_100320-V1012-Web-M1VLN27117001'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  updateServerNetwork(
    _serverId: any,
    _networkId: any,
    _networkData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.UpdateServerNic;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      networkId: 'ff474c18-9d3e-4214-b33f-f434a689bca4',
      networkName: 'Customer_100320-V1012-Web-M1VLN27117001'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  deleteServerNetwork(
    _serverId: any,
    _networkId: any,
    _networkData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.DeleteServerNic;
    mcsApiJobMock.status = McsJobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      networkId: 'ff474c18-9d3e-4214-b33f-f434a689bca4',
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  convertResourceToMap(_resources: Resource[]): Map<string, Resource> {
    return new Map<string, Resource>();
  },
  computeAvailableMemoryMB(_resource: Resource): number {
    return 0;
  },
  computeAvailableCpu(_resource: Resource): number {
    return 0;
  }
};
