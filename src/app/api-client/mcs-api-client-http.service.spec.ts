import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsApiRequestParameter } from '@app/models';

import { McsApiClientHttpService } from './mcs-api-client-http.service';
import { McsApiClientConfig } from './mcs-api-client.config';
import { McsApiClientTestingModule } from './testing/mcs-api-client-testing.module';

describe('McsApiClientHttpService', () => {

  /** Stub Services Mock */
  let mockBackend: HttpTestingController;
  let apiClientService: McsApiClientHttpService;
  let apiClientConfig: McsApiClientConfig;

  beforeEach(waitForAsync(() => {
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
      mockBackend = TestBed.inject(HttpTestingController);
      apiClientService = TestBed.inject(McsApiClientHttpService);
      apiClientConfig = TestBed.inject(McsApiClientConfig);
    });
  }));

  /** Test Implementation */
  describe('getFullUrl', () => {
    it('should return the full URL', () => {
      let inputEndPoint: string = '/private-cloud/servers';
      let expectedUrl: string = apiClientConfig.apiHost.concat(inputEndPoint);
      let actualUrl: string = '';
      actualUrl = apiClientService.getFullUrl(inputEndPoint);
      expect(actualUrl).toBe(expectedUrl);
    });
  });

  /** We need to call verify to make sure there is no pending request in each request */
  afterEach(waitForAsync((() => {
    mockBackend.verify();
  })));

  describe('get', () => {
    it('should get Observable response', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';
      apiClientService.get(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.flush({
        status: 200,
        content: 'Mock value',
        totalCount: 1
      });
    });

    it('should call handleError method when error occured', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.get(mcsApiRequestParameter)
        .subscribe(
          (response) => { expect(response).toBeDefined(); },
          (error) => { expect(error).toBeDefined(); }
        );

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.error(new ErrorEvent('Error'));
    });
  });

  describe('post', () => {
    it('should insert new entry', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.post(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(201);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.flush({
        status: 201,
        statusText: 'success'
      });
    });

    it('should call handleError method when error occured', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.post(mcsApiRequestParameter)
        .subscribe(
          (response) => { expect(response).toBeDefined(); },
          (error) => { expect(error).toBeDefined(); }
        );

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('POST');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.error(new ErrorEvent('Error'));
    });
  });

  describe('patch', () => {
    it('should update some fields of the existing entry', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.patch(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(201);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('PATCH');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.flush({
        status: 201,
        statusText: 'success'
      });
    });

    it('should call handleError method when error occured', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.patch(mcsApiRequestParameter)
        .subscribe(
          (response) => { expect(response).toBeDefined(); },
          (error) => { expect(error).toBeDefined(); }
        );

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('PATCH');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.error(new ErrorEvent('Error'));
    });
  });

  describe('put', () => {
    it('should save updated to existing entry', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.put(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(201);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.flush({
        status: 201,
        statusText: 'success'
      });
    });

    it('should call handleError method when error occured', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.put(mcsApiRequestParameter)
        .subscribe(
          (response) => { expect(response).toBeDefined(); },
          (error) => { expect(error).toBeDefined(); }
        );

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('PUT');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.error(new ErrorEvent('Error'));
    });
  });

  describe('delete', () => {
    it('should delete existing entry', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.delete(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(201);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.flush({
        status: 201,
        statusText: 'success'
      });
    });

    it('should call handleError method when error occured', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/private-cloud/servers';
      mcsApiRequestParameter.responseType = 'json';

      apiClientService.delete(mcsApiRequestParameter)
        .subscribe(
          (response) => { expect(response).toBeDefined(); },
          (error) => { expect(error).toBeDefined(); }
        );

      // Create request to the backend and expect that the request happened
      let mockRequest = mockBackend.expectOne(mcsApiRequestParameter.endPoint);
      expect(mockRequest.request.method).toEqual('DELETE');

      // Create response data and transmit, expect the result should go to subscribe callback
      mockRequest.error(new ErrorEvent('Error'));
    });
  });
});
