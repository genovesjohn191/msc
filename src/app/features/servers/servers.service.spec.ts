import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import {
  Server,
  ServerThumbnail,
  ServerUpdate,
  ServerClientObject,
  ServerCommand,
  ServerPowerState,
  ServerPlatform,
  ServerResource,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerNetwork,
  ServerManageNetwork,
  ServerManageMedia,
  ServerCreate,
  ServerClone,
  ServerGroupedOs
} from './models';
import { ServersService } from './servers.service';
import {
  McsApiJob,
  McsApiSuccessResponse,
  CoreDefinition
} from '../../core';
import { ServersTestingModule } from './testing';

describe('ServersService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let serversService: ServersService;
  let requestOptions = {
    page: 1,
    perPage: 10,
    searchKeyword: 'Arrian',
    id: 459,
    action: ServerCommand.Start,
    referenceObject: { command: 1, clientReferenceObject: undefined }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        ServersTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      serversService = getTestBed().get(ServersService);
    });
  }));

  /** Test Implementation */
  describe('getServers()', () => {
    it('should get all servers from API calls', () => {
      serversService.getServers({
        page: requestOptions.page,
        perPage: requestOptions.perPage,
        searchKeyword: requestOptions.searchKeyword
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne('/servers');
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Server[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getServer()', () => {
    it('should get the server based on ID from API calls', () => {
      serversService.getServer(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Server>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('putServerCommand()', () => {
    it('should put the server command to process the server through API calls', () => {
      serversService.putServerCommand(
        requestOptions.id,
        requestOptions.action,
        requestOptions.referenceObject
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/power`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('resetVmPassowrd()', () => {
    it('should reset the VM server through API calls', () => {
      serversService.resetVmPassowrd(
        requestOptions.id,
        requestOptions.referenceObject
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/password/reset`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('patchServer()', () => {
    it('should put the server command to process the server through API calls', () => {
      serversService.patchServer(
        requestOptions.id,
        new ServerUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}`);
      expect(mockRequest.request.method).toEqual('PATCH');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('createServer()', () => {
    it('should create a server through API calls', () => {
      serversService.createServer(
        new ServerCreate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('cloneServer()', () => {
    it('should clone a server through API calls', () => {
      serversService.cloneServer(
        requestOptions.id.toString(),
        new ServerClone()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/clone`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerOs()', () => {
    it('should get the server OS from API calls', () => {
      serversService.getServerOs()
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/os`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerGroupedOs[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerStorage()', () => {
    it('should get the server storage based on ID from API calls', () => {
      serversService.getServerStorage(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/disks`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerStorageDevice[]>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('createServerStorage()', () => {
    it('should create server storage through API calls', () => {
      serversService.createServerStorage(
        requestOptions.id,
        new ServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/disks`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('updateServerStorage()', () => {
    it('should update the server storage through API calls', () => {
      let storageId = '12345';
      serversService.updateServerStorage(
        requestOptions.id,
        storageId,
        new ServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/disks/${storageId}`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('deleteServerStorage()', () => {
    it('should delete the server storage through API calls', () => {
      let storageId = '12345';
      serversService.deleteServerStorage(
        requestOptions.id,
        storageId,
        new ServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/disks/${storageId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerThumbnail()', () => {
    it('should get the server thumbnail based on ID from API calls', () => {
      serversService.getServerThumbnail(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/thumbnail`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerThumbnail>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerNetworks()', () => {
    it('should get the server networks based on ID from API calls', () => {
      serversService.getServerNetworks(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/networks`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerNetwork[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('addServerNetwork()', () => {
    it('should add the server network through API calls', () => {
      serversService.addServerNetwork(
        requestOptions.id,
        new ServerManageNetwork()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/networks`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('updateServerNetwork()', () => {
    it('should update the server network through API calls', () => {
      let networkId = '12345';

      serversService.updateServerNetwork(
        requestOptions.id,
        networkId,
        new ServerManageNetwork()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/networks/${networkId}`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('deleteServerNetwork()', () => {
    it('should delete the server network through API calls', () => {
      let networkId = '12345';

      serversService.deleteServerNetwork(
        requestOptions.id,
        networkId,
        new ServerManageNetwork()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/networks/${networkId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('attachServerMedia()', () => {
    it('should attach server media through API calls', () => {
      serversService.attachServerMedia(
        requestOptions.id,
        new ServerManageMedia()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/media`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('detachServerMedia()', () => {
    it('should detach server media through API calls', () => {
      let mediaId = '12345';

      serversService.detachServerMedia(
        requestOptions.id,
        mediaId,
        new ServerManageMedia()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/media/${mediaId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getPlatformData()', () => {
    it('should get the plaform data from API calls', () => {
      serversService.getPlatformData()
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/platform`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerPlatform>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getResources()', () => {
    it('should get the resources data from API calls', () => {
      serversService.getResources()
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/resources`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerResource[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('getActiveServerPowerState()', () => {
    it('should return PoweredOn when the command action is Start and Job is completed', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Start;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(ServerPowerState.PoweredOn);
    });

    it('should return PoweredOn when the command action is Restart and Job is completed', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Restart;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(ServerPowerState.PoweredOn);
    });

    it('should return PoweredOff when the command action is Stop and Job is completed', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(ServerPowerState.PoweredOff);
    });

    it('should return undefined when Job is Active', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBeUndefined();
    });

    it('should return undefined when Job is Pending', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_PENDING;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBeUndefined();
    });

    it('should return the previous power state of the server when Job is Failed', () => {
      let serverClient = new ServerClientObject();
      let previousPowerState = ServerPowerState.PoweredOn;

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_FAILED;
      serverClient.powerState = previousPowerState;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(previousPowerState);
    });

    it('should return the previous power state of the server when Job is Timedout', () => {
      let serverClient = new ServerClientObject();
      let previousPowerState = ServerPowerState.PoweredOn;

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_TIMEDOUT;
      serverClient.powerState = previousPowerState;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(previousPowerState);
    });

    it('should return the previous power state of the server when Job is Cancelled', () => {
      let serverClient = new ServerClientObject();
      let previousPowerState = ServerPowerState.PoweredOn;

      serverClient.commandAction = ServerCommand.Stop;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_CANCELLED;
      serverClient.powerState = previousPowerState;
      let serverState = serversService.getActiveServerPowerState(serverClient);

      expect(serverState).toBe(previousPowerState);
    });
  });

  describe('getActiveServerInformation()', () => {

    it('should return the tooltip information of the active server', () => {
      let serverClient = new ServerClientObject();

      serverClient.commandAction = ServerCommand.Start;
      serverClient.notificationStatus = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      serverClient.tooltipInformation = 'Sample';
      serverClient.serverId = '12345';

      serversService.activeServers.push(serverClient);
      let serverInformation = serversService.getActiveServerInformation('12345');

      expect(serverInformation).toBe('Sample');
    });
  });
});
