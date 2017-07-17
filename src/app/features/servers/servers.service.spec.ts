import {
  async,
  TestBed,
  getTestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  BaseRequestOptions,
  Response,
  HttpModule,
  Http,
  XHRBackend,
  RequestMethod,
  URLSearchParams
} from '@angular/http';
import {
  MockBackend,
  MockConnection
} from '@angular/http/testing';
import { ResponseOptions } from '@angular/http';
/** Services and Models */
import {
  Server,
  ServerThumbnail,
  ServerUpdate
} from './models';
import { ServersService } from './servers.service';
import {
  McsApiJob,
  McsApiService,
  McsAuthService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsNotificationJobService,
  McsNotificationContextService,
  CoreConfig,
  CoreDefinition
} from '../../core/';
import {
  Observable,
  Subject
} from 'rxjs/Rx';

describe('ServersService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let mcsApiService: McsApiService;
  let serversService: ServersService;
  let coreConfig = {
    apiHost: 'http://localhost:5000/api',
    imageRoot: 'assets/img/'
  } as CoreConfig;
  let mockMcsNotificationJobService = {
    notificationStream: new Subject<any>(),
    connectionStatusStream: new Subject<any>()
  } as McsNotificationJobService;
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
        ServersService,
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
        },
        {
          provide: McsNotificationJobService,
          useValue: mockMcsNotificationJobService
        },
        McsNotificationContextService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(MockBackend);
      mcsApiService = getTestBed().get(McsApiService);
      serversService = getTestBed().get(ServersService);
    });
  }));

  /** Test Implementation */
  describe('getServers()', () => {
    let requestOptions = {
      page: 1,
      perPage: CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE,
      serverName: 'mongo'
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                status: 200,
                content: [
                  {
                    id: 1,
                    serviceId: '12345',
                    serviceDescription: 'mongo-db-1'
                  },
                  {
                    id: 2,
                    serviceId: '12346',
                    serviceDescription: 'mongo-db-2'
                  }
                ],
                totalCount: 1
              }]
          }
          )));
      });
    });

    it('should set the parameters(page, per_page, search_keyword) based on input', fakeAsync(() => {
      mockBackend.connections.subscribe((connection) => {
        let parameters = connection.request.url.split('?');
        let urlSearchParams: URLSearchParams;
        urlSearchParams = new URLSearchParams(parameters[1]);

        expect(urlSearchParams.get('page')).toEqual(requestOptions.page.toString());
        expect(urlSearchParams.get('per_page')).toEqual(requestOptions.perPage.toString());
        expect(urlSearchParams.get('search_keyword')).toEqual(requestOptions.serverName);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });
    }));

    it('should map response to McsApiSuccessResponse<Server[]> when successful', fakeAsync(() => {
      serversService.getServers(1, CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE, 'mongo')
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Server[]>;
          mcsApiSucessResponse = response[0];

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse.status).toEqual(200);
          expect(mcsApiSucessResponse.totalCount).toEqual(1);
          expect(mcsApiSucessResponse.content).toBeDefined();

          expect(mcsApiSucessResponse.content[0].id).toEqual(1);
          expect(mcsApiSucessResponse.content[0].serviceId).toEqual('12345');
          expect(mcsApiSucessResponse.content[0].serviceDescription).toEqual('mongo-db-1');

          expect(mcsApiSucessResponse.content[1].id).toEqual(2);
          expect(mcsApiSucessResponse.content[1].serviceId).toEqual('12346');
          expect(mcsApiSucessResponse.content[1].serviceDescription).toEqual('mongo-db-2');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        let parameters = connection.request.url.split('?');
        let urlSearchParams: URLSearchParams;
        urlSearchParams = new URLSearchParams(parameters[1]);

        expect(urlSearchParams.get('page')).toEqual(requestOptions.page.toString());
        expect(urlSearchParams.get('per_page')).toEqual(requestOptions.perPage.toString());
        expect(urlSearchParams.get('search_keyword')).toEqual(requestOptions.serverName);
        expect(connection.request.method).toBe(RequestMethod.Get);

        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      serversService.getServers(
        requestOptions.page,
        requestOptions.perPage,
        requestOptions.serverName
      )
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe((response) => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('getServer()', () => {
    let requestOptions = {
      id: 459,
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 459,
                    serviceId: 'MXCVM27117039',
                    serviceDescription: 'Virtual Data Centre VM Instance'
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Server> when successful', fakeAsync(() => {
      serversService.getServer(requestOptions.id)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Server>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
          expect(mcsApiSucessResponse[0].content[0].serviceId).toEqual('MXCVM27117039');
          expect(mcsApiSucessResponse[0].content[0].serviceDescription)
            .toEqual('Virtual Data Centre VM Instance');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
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

      serversService.getServer(requestOptions.id)
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe((response) => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('postServerCommand()', () => {
    let requestOptions = {
      id: 500,
      action: 'Start',
      referenceObject: { command: 1, clientReferenceObject: undefined }
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 500,
                    type: 0,
                    summaryInformation: 'Server Posting'
                  }
                ],
                status: 200
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Server> when successful', fakeAsync(() => {
      serversService.postServerCommand(
        requestOptions.id,
        requestOptions.action,
        requestOptions.referenceObject
      )
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<McsApiJob>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
          expect(mcsApiSucessResponse[0].content[0].type).toEqual(0);
          expect(mcsApiSucessResponse[0].content[0].summaryInformation)
            .toEqual('Server Posting');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
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

      serversService.postServerCommand(
        requestOptions.id,
        requestOptions.action,
        requestOptions.referenceObject
      )
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe((response) => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('patchServer()', () => {
    let requestOptions = {
      id: 500,
      serverUpdate: new ServerUpdate()
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 500,
                    type: 0,
                    summaryInformation: 'Server Patching'
                  }
                ],
                status: 200
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Server> when successful', fakeAsync(() => {
      serversService.patchServer(requestOptions.id, requestOptions.serverUpdate)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<McsApiJob>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
          expect(mcsApiSucessResponse[0].content[0].type).toEqual(0);
          expect(mcsApiSucessResponse[0].content[0].summaryInformation)
            .toEqual('Server Patching');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
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

      serversService.patchServer(requestOptions.id, requestOptions.serverUpdate)
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe((response) => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('getServerThumbnail()', () => {
    let requestOptions = {
      id: 500,
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 500,
                    fileType: 'image/png',
                    file: 'aacsdftyAAABBBggguuu',
                    encoding: 'base64'
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<ServerThumbnail> when successful',
      fakeAsync(() => {
        serversService.getServerThumbnail(requestOptions.id)
          .subscribe((response) => {
            let mcsApiSucessResponse: McsApiSuccessResponse<ServerThumbnail>;
            mcsApiSucessResponse = response;

            expect(response).toBeDefined();
            expect(mcsApiSucessResponse[0].status).toEqual(200);
            expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
            expect(mcsApiSucessResponse[0].content).toBeDefined();

            expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
            expect(mcsApiSucessResponse[0].content[0].fileType).toEqual('image/png');
            expect(mcsApiSucessResponse[0].content[0].file).toEqual('aacsdftyAAABBBggguuu');
            expect(mcsApiSucessResponse[0].content[0].encoding).toEqual('base64');
          });
      }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
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

      serversService.getServerThumbnail(requestOptions.id)
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe((response) => {
          // dummy subscribe to invoke exception
        });
    }));
  });
});
