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
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerNicSummary,
  ServerManageNic,
  ServerManageMedia,
  ServerCreate,
  ServerClone,
  ServerOperatingSystem
} from './models';
import { ServersService } from './servers.service';
import {
  McsApiJob,
  McsApiSuccessResponse
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
    referenceObject: {
      commandAction: 1,
      processingText: 'process'
    } as ServerClientObject
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
        searchKeyword: undefined
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/servers?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
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
      serversService.resetVmPassword(
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

  describe('renameServer()', () => {
    it('should rename the server through API calls', () => {
      serversService.renameServer(
        requestOptions.id,
        { name: 'sample', clientReferenceObject: undefined }
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/name`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsApiJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('patchServer()', () => {
    it('should put the server command to process the server through API calls', () => {
      serversService.updateServerCompute(
        requestOptions.id,
        new ServerUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/compute`);
      expect(mockRequest.request.method).toEqual('PUT');

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
      let responseData = new McsApiSuccessResponse<ServerOperatingSystem[]>();
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
      serversService.getServerNics(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/nics`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<ServerNicSummary[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('addServerNetwork()', () => {
    it('should add the server network through API calls', () => {
      serversService.addServerNic(
        requestOptions.id,
        new ServerManageNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/nics`);
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

      serversService.updateServerNic(
        requestOptions.id,
        networkId,
        new ServerManageNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/nics/${networkId}`);
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

      serversService.deleteServerNic(
        requestOptions.id,
        networkId,
        new ServerManageNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/servers/${requestOptions.id}/nics/${networkId}`);
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
});
