import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { McsApiRequestParameter } from '@app/models';
import { CoreConfig } from '../core.config';
import { McsApiService } from '../services/mcs-api.service';
import { CoreTestingModule } from '../testing';

describe('McsApiService', () => {

  /** Stub Services Mock */
  let mockBackend: HttpTestingController;
  let mcsApiService: McsApiService;
  let coreConfig: CoreConfig;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(HttpTestingController);
      mcsApiService = getTestBed().get(McsApiService);
      coreConfig = getTestBed().get(CoreConfig);
    });
  }));

  /** Test Implementation */
  describe('getFullUrl', () => {
    it('should return the full URL', () => {
      let inputEndPoint: string = '/servers';
      let expectedUrl: string = coreConfig.apiHost.concat(inputEndPoint);
      let actualUrl: string = '';
      actualUrl = mcsApiService.getFullUrl(inputEndPoint);
      expect(actualUrl).toBe(expectedUrl);
    });
  });

  /** We need to call verify to make sure there is no pending request in each request */
  afterEach(async((() => {
    mockBackend.verify();
  })));

  describe('get', () => {
    it('should get Observable response', () => {
      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';
      mcsApiService.get(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.get(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.post(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.post(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.patch(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.patch(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.put(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.put(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.delete(mcsApiRequestParameter)
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
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiRequestParameter.responseType = 'json';

      mcsApiService.delete(mcsApiRequestParameter)
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
