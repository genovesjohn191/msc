import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { McsApiServersService } from './mcs-api-servers.service';
import {
  McsJob,
  McsApiSuccessResponse,
  McsServer,
  McsServerThumbnail,
  McsServerUpdate,
  McsServerPowerstateCommand,
  McsServerStorageDevice,
  McsServerStorageDeviceUpdate,
  McsServerNic,
  McsServerCreateNic,
  McsServerCreate,
  McsServerClone,
  McsServerOperatingSystem,
  McsServerAttachMedia
} from '@app/models';
import { McsApiClientTestingModule } from '../testing';

describe('ServersApiService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let serversApiService: McsApiServersService;
  let requestOptions = {
    page: 1,
    perPage: 10,
    searchKeyword: 'Arrian',
    id: '459',
    referenceObject: {
      commandAction: 1,
      processingText: 'process'
    }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        McsApiClientTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      serversApiService = getTestBed().get(McsApiServersService);
    });
  }));

  /** Test Implementation */
  describe('getServers()', () => {
    it('should get all servers from API calls', () => {
      serversApiService.getServers({
        pageIndex: requestOptions.page,
        pageSize: requestOptions.perPage,
        keyword: undefined
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/private-cloud/servers?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServer[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getServer()', () => {
    it('should get the server based on ID from API calls', () => {
      serversApiService.getServer(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServer>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('sendServerPowerState()', () => {
    it('should put the server command to process the server through API calls', () => {
      serversApiService.sendServerPowerState(
        requestOptions.id,
        new McsServerPowerstateCommand()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/power`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('resetVmPassowrd()', () => {
    it('should reset the VM server through API calls', () => {
      serversApiService.resetVmPassword(
        requestOptions.id,
        {
          clientReferenceObject: {
            serverId: requestOptions.id
          }
        }
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/password/reset`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('renameServer()', () => {
    it('should rename the server through API calls', () => {
      serversApiService.renameServer(
        requestOptions.id,
        { name: 'sample', clientReferenceObject: undefined }
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/name`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('patchServer()', () => {
    it('should put the server command to process the server through API calls', () => {
      serversApiService.updateServerCompute(
        requestOptions.id,
        new McsServerUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/compute`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('createServer()', () => {
    it('should create a server through API calls', () => {
      serversApiService.createServer(
        new McsServerCreate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('cloneServer()', () => {
    it('should clone a server through API calls', () => {
      serversApiService.cloneServer(
        requestOptions.id.toString(),
        new McsServerClone()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/clone`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerOs()', () => {
    it('should get the server OS from API calls', () => {
      serversApiService.getServerOs()
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/os`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServerOperatingSystem[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerStorage()', () => {
    it('should get the server storage based on ID from API calls', () => {
      serversApiService.getServerStorage(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/disks`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServerStorageDevice[]>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('createServerStorage()', () => {
    it('should create server storage through API calls', () => {
      serversApiService.createServerStorage(
        requestOptions.id,
        new McsServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/disks`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('updateServerStorage()', () => {
    it('should update the server storage through API calls', () => {
      let storageId = '12345';
      serversApiService.updateServerStorage(
        requestOptions.id,
        storageId,
        new McsServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/disks/${storageId}`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('deleteServerStorage()', () => {
    it('should delete the server storage through API calls', () => {
      let storageId = '12345';
      serversApiService.deleteServerStorage(
        requestOptions.id,
        storageId,
        new McsServerStorageDeviceUpdate()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/disks/${storageId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerThumbnail()', () => {
    it('should get the server thumbnail based on ID from API calls', () => {
      serversApiService.getServerThumbnail(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/thumbnail`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServerThumbnail>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getServerNetworks()', () => {
    it('should get the server networks based on ID from API calls', () => {
      serversApiService.getServerNics(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/nics`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsServerNic[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      mockRequest.flush(responseData);
    });
  });

  describe('addServerNetwork()', () => {
    it('should add the server network through API calls', () => {
      serversApiService.addServerNic(
        requestOptions.id,
        new McsServerCreateNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/nics`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('updateServerNetwork()', () => {
    it('should update the server network through API calls', () => {
      let networkId = '12345';

      serversApiService.updateServerNic(
        requestOptions.id,
        networkId,
        new McsServerCreateNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/nics/${networkId}`);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('deleteServerNetwork()', () => {
    it('should delete the server network through API calls', () => {
      let networkId = '12345';

      serversApiService.deleteServerNic(
        requestOptions.id,
        networkId,
        new McsServerCreateNic()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/nics/${networkId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('attachServerMedia()', () => {
    it('should attach server media through API calls', () => {
      serversApiService.attachServerMedia(
        requestOptions.id,
        new McsServerAttachMedia()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/media`);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('detachServerMedia()', () => {
    it('should detach server media through API calls', () => {
      let mediaId = '12345';

      serversApiService.detachServerMedia(
        requestOptions.id,
        mediaId,
        new McsServerAttachMedia()
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(1);
      });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/media/${mediaId}`);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });
});
