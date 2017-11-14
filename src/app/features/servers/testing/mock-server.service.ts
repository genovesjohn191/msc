import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsApiSuccessResponse,
  McsApiJob,
  McsJobType,
} from '../../../core';
import {
  Server,
  ServerPowerState,
  ServerThumbnail,
  ServerPlatform,
  ServerResource,
  ServerNetwork,
  ServerServiceType,
  ServerStorageDeviceUpdate,
  ServerCatalogType,
  ServerCatalogItemType
} from '../models';

export const mockServerService = {

  selectedServerStream: new Subject<any>(),
  getServer(_id: any): Observable<McsApiSuccessResponse<Server>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Server>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = {
      id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      managementName: 'contoso-lin01',
      resource: {
        name: 'M1VDC27117001'
      },
      serviceType: ServerServiceType.Managed,
      powerState: ServerPowerState.PoweredOn,
    } as Server;

    return Observable.of(mcsApiResponseMock);
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

    return Observable.of(mcsApiResponseMock);
  },
  getServerThumbnail(_serverId: any) {
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
              id: '847adb5a-6afe-44c9-a1cc-1c19eb7a1981',
              name: 'M1VDC27117001',
              serviceType: ServerServiceType.SelfManaged,
              availabilityZone: 'IC1',
              cpuAllocation: 10,
              cpuReservation: 2,
              cpuLimit: 10,
              cpuUsed: 0,
              memoryAllocationMB: 32768,
              memoryReservationMB: 6553,
              memoryLimitMB: 32768,
              memoryUsedMB: 0,
              url: 'https://labvcloud.macquarieview.com/cloud/org/Macquarie_Telecom_Contoso_100320',
              storage: [
                {
                  name: 'T2000-PVDC0301',
                  enabled: true,
                  limitMB: 1024000,
                  usedMB: 359471.22
                }
              ],
              networks: new Array<ServerNetwork>(),
              catalogs: [
                {
                  id: 'd570cc74-493a-45dc-a714-3525bcd0fc19',
                  name: 'Customer_100320_SVC_Contoso',
                  type: ServerCatalogType.SelfManaged,
                  itemName: 'test-template',
                  itemType: ServerCatalogItemType.Template
                }
              ],
              vApps: [
                {
                  name: 'api-server',
                  virtualMachines: [
                    {
                      name: 'api-server2'
                    },
                    {
                      name: 'api-server'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    return Observable.of(mcsApiResponseMock);
  },
  getResources() {
    let mcsApiResponseMock = new McsApiSuccessResponse<ServerResource[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = [
      {
        id: '097379e6-c003-42ab-8ab6-5884a810b9ef',
        name: 'M1VDC27117001',
        serviceType: ServerServiceType.Managed
      } as ServerResource,
      {
        id: '847adb5a-6afe-44c9-a1cc-1c19eb7a1981',
        name: 'M1SVC27117002',
        serviceType: ServerServiceType.SelfManaged
      } as ServerResource
    ];

    return Observable.of(mcsApiResponseMock);
  },
  createServerStorage(
    _serverId: any,
    _storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.CreateServerDisk;
    mcsApiJobMock.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      storageProfile: 'T2000-PVDC0301',
      sizeMB: 2048
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return Observable.of(mcsApiResponseMock);
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
    mcsApiJobMock.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      diskId: '1d6d55d7-0b02-4341-9359-2e4bc783d9b1'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return Observable.of(mcsApiResponseMock);
  },
  deleteServerStorage(
    _serverId: any,
    _storageId: any
  ): Observable<McsApiSuccessResponse<McsApiJob>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();

    let mcsApiJobMock = new McsApiJob();
    mcsApiJobMock.id = '5';
    mcsApiJobMock.type = McsJobType.UpdateServerDisk;
    mcsApiJobMock.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
    mcsApiJobMock.clientReferenceObject = {
      serverId: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
      diskId: '1d6d55d7-0b02-4341-9359-2e4bc783d9b1'
    };
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 1;
    mcsApiResponseMock.content = mcsApiJobMock;

    return Observable.of(mcsApiResponseMock);
  }
};
