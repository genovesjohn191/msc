import {
  async,
  inject,
  TestBed,
  getTestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  Headers,
  BaseRequestOptions,
  Response,
  HttpModule,
  Http,
  XHRBackend,
  RequestMethod
} from '@angular/http';
import {
  MockBackend,
  MockConnection
} from '@angular/http/testing';
import { ResponseOptions } from '@angular/http';
import { CoreConfig } from '../core.config';
import { McsApiService } from './mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { AppState } from '../../app.service';
import { McsAuthService } from './mcs-auth.service';

describe('McsApiService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let mcsApiService: McsApiService;
  let coreConfig = {
    apiHost: 'http://localhost:5000/api',
    imageRoot: 'assets/img/'
  } as CoreConfig;
  let mockAuthService = {
    authToken: '',
    navigateToLoginPage(): void {
      // Do something
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        AppState,
        McsApiService,
        { provide: McsAuthService, useValue: mockAuthService },
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        },
        {
          provide: CoreConfig,
          useValue: coreConfig
        }
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(MockBackend);
      mcsApiService = getTestBed().get(McsApiService);
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

  describe('get', () => {
    it('should get Observable response', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Get);
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                status: 200,
                content: 'Mock value',
                totalCount: 1
              }]
          }
          )));
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers';
      mcsApiService.get(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
        });
    }));

    it('should call handleError method when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Get);
        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers';

      spyOn(mcsApiService, 'handleError');
      mcsApiService.get(mcsApiRequestParameter)
        .finally(() => {
          expect(mcsApiService.handleError).toHaveBeenCalled();
        });
    }));
  });

  describe('post', () => {
    it('should insert new entry', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Post);
        connection.mockRespond(new Response(
          new ResponseOptions({
            status: 201,
            statusText: 'success'
          }
          )));
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      mcsApiService.post(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
        });
    }));

    it('should call handleError method when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Post);
        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      spyOn(mcsApiService, 'handleError');
      mcsApiService.post(mcsApiRequestParameter)
        .finally(() => {
          expect(mcsApiService.handleError).toHaveBeenCalled();
        });
    }));
  });

  describe('patch', () => {
    it('should update some fields of the existing entry', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Patch);
        connection.mockRespond(new Response(
          new ResponseOptions({
            status: 201,
            statusText: 'success'
          }
          )));
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      mcsApiService.patch(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
        });
    }));

    it('should call handleError method when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Patch);
        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      spyOn(mcsApiService, 'handleError');
      mcsApiService.patch(mcsApiRequestParameter)
        .finally(() => {
          expect(mcsApiService.handleError).toHaveBeenCalled();
        });
    }));
  });

  describe('put', () => {
    it('should save updated to existing entry', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Put);
        connection.mockRespond(new Response(
          new ResponseOptions({
            status: 204,
            statusText: 'success'
          }
          )));
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      mcsApiService.put(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
        });
    }));

    it('should call handleError method when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Put);
        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';
      mcsApiRequestParameter.recordData = 'title: server';

      spyOn(mcsApiService, 'handleError');
      mcsApiService.put(mcsApiRequestParameter)
        .finally(() => {
          expect(mcsApiService.handleError).toHaveBeenCalled();
        });
    }));
  });

  describe('delete', () => {
    it('should delete existing entry', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Delete);
        connection.mockRespond(new Response(
          new ResponseOptions({
            status: 204,
            statusText: 'success'
          }
          )));
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';

      mcsApiService.delete(mcsApiRequestParameter)
        .subscribe((response) => {
          expect(response).toBeDefined();
        });
    }));

    it('should call handleError method when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Delete);
        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
      mcsApiRequestParameter.endPoint = '/servers/id';

      spyOn(mcsApiService, 'handleError');
      mcsApiService.delete(mcsApiRequestParameter)
        .finally(() => {
          expect(mcsApiService.handleError).toHaveBeenCalled();
        });
    }));
  });
});
