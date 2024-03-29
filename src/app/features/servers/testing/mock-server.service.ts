import {
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  VmPowerState,
  ServiceType,
  McsApiSuccessResponse,
  McsJob,
  JobType,
  JobStatus,
  McsResource,
  McsServer,
  McsServerThumbnail,
  McsServerStorageDeviceUpdate,
  McsServerCreateNic
} from '@app/models';
import { ServerDetails } from '../server/server-details';

export const mockServerService = {

  getServerDetails(): Observable<ServerDetails> {
    return of(new ServerDetails());
  },
  getServerId(): string {
    return 'fake-id-123';
  },
  selectedServerStream: new Subject<any>(),
  getServer(_id: any): Observable<McsApiSuccessResponse<McsServer>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsServer>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = {
      id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      name: 'contoso-lin01',
      platform: {
        environmentName: 'Macquarie_Telecom_Contoso_100320',
        resourceName: 'M1VDC27117001'
      },
      serviceType: ServiceType.Managed,
      powerState: VmPowerState.PoweredOn,
    } as McsServer;

    return of(mcsApiResponseMock);
  },
  setSelectedServer(server: McsServer) {
    this.selectedServerStream.next(server);
  },
  selectedServer(): Observable<McsServer> {
    return this.selectedServerStream;
  },
  setPerformanceScale(
    _serverId: any,
    _cpuSizeScale: any): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new McsJob();

    return of(mcsApiResponseMock);
  },
  getServerThumbnail(_serverId: any) {
    return of({
      content: {
        file: 'aaaBBBcccDDD',
        fileType: 'image/png',
        encoding: 'base64'
      } as McsServerThumbnail
    });
  },

  getServerResources() {
    let mcsApiResponseMock = new McsApiSuccessResponse<McsResource[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array<McsResource>();

    return of(mcsApiResponseMock);
  },
  createServerStorage(
    _serverId: any,
    _storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerCreateDisk;
    mcsApiJobMock.status = JobStatus.Active;
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
    _storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerUpdateDisk;
    mcsApiJobMock.status = JobStatus.Active;
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
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerUpdateDisk;
    mcsApiJobMock.status = JobStatus.Active;
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
    _networkData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerCreateNic;
    mcsApiJobMock.status = JobStatus.Active;
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
    _networkData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerUpdateNic;
    mcsApiJobMock.status = JobStatus.Active;
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
    _networkData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsJob>();

    let mcsApiJobMock = new McsJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = JobType.ServerDeleteNic;
    mcsApiJobMock.status = JobStatus.Active;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      networkId: 'ff474c18-9d3e-4214-b33f-f434a689bca4',
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return of(mcsApiResponseMock);
  },
  convertResourceToMap(_resources: McsResource[]): Map<string, McsResource> {
    return new Map<string, McsResource>();
  },
  computeAvailableMemoryMB(_resource: McsResource): number {
    return 0;
  },
  computeAvailableCpu(_resource: McsResource): number {
    return 0;
  }
};
