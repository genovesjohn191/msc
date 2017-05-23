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
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import { NotificationsService } from './notifications.service';
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  CoreConfig,
  CoreDefinition,
  McsApiJob
} from '../../core/';

describe('NotificationsService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let mcsApiService: McsApiService;
  let notificationsService: NotificationsService;
  let coreConfig = {
    apiHost: 'http://localhost:5000',
    imageRoot: 'assets/img/',
    notification: {
      host: 'ws://localhost:15674/ws',
      routePrefix: 'mcs.portal.notification',
      user: 'guest',
      password: 'guest'
    }
  } as CoreConfig;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        NotificationsService,
        McsApiService,
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
      notificationsService = getTestBed().get(NotificationsService);
    });
  }));

  /** Test Implementation */
  describe('getNotifications()', () => {
    let requestOptions = {
      page: 1,
      perPage: CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE,
      searchKeyword: 'start'
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
                    id: '1',
                    status: CoreDefinition.NOTIFICATION_JOB_COMPLETED,
                    ownerName: 'arrian'
                  },
                  {
                    id: '2',
                    status: CoreDefinition.NOTIFICATION_JOB_ACTIVE,
                    ownerName: 'arrian'
                  }
                ],
                totalCount: 2
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
        expect(urlSearchParams.get('search_keyword')).toEqual(requestOptions.searchKeyword);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });
    }));

    it('should map response to McsApiSuccessResponse<McsApiJob[]> when successful',
      fakeAsync(() => {
        notificationsService.getNotifications(requestOptions.page,
          requestOptions.perPage, requestOptions.searchKeyword)
          .subscribe((response) => {
            let mcsApiSucessResponse: McsApiSuccessResponse<McsApiJob[]>;
            mcsApiSucessResponse = response[0];

            expect(response).toBeDefined();
            expect(mcsApiSucessResponse.status).toEqual(200);
            expect(mcsApiSucessResponse.totalCount).toEqual(2);
            expect(mcsApiSucessResponse.content).toBeDefined();

            expect(mcsApiSucessResponse.content[0].id).toEqual('1');
            expect(mcsApiSucessResponse.content[0].status)
              .toEqual(CoreDefinition.NOTIFICATION_JOB_COMPLETED);
            expect(mcsApiSucessResponse.content[0].ownerName).toEqual('arrian');

            expect(mcsApiSucessResponse.content[1].id).toEqual('2');
            expect(mcsApiSucessResponse.content[1].status)
              .toEqual(CoreDefinition.NOTIFICATION_JOB_ACTIVE);
            expect(mcsApiSucessResponse.content[1].ownerName).toEqual('arrian');
          });
      }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        let parameters = connection.request.url.split('?');
        let urlSearchParams: URLSearchParams;
        urlSearchParams = new URLSearchParams(parameters[1]);

        expect(urlSearchParams.get('page')).toEqual(requestOptions.page.toString());
        expect(urlSearchParams.get('per_page')).toEqual(requestOptions.perPage.toString());
        expect(urlSearchParams.get('search_keyword')).toEqual(requestOptions.searchKeyword);
        expect(connection.request.method).toBe(RequestMethod.Get);

        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      notificationsService.getNotifications(
        requestOptions.page,
        requestOptions.perPage,
        requestOptions.searchKeyword
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

  describe('getNotification()', () => {
    let requestOptions = {
      id: '459',
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: '459',
                    status: CoreDefinition.NOTIFICATION_JOB_ACTIVE,
                    ownerName: 'arrian'
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<McsApiJob> when successful',
      fakeAsync(() => {
        notificationsService.getNotification(459)
          .subscribe((response) => {
            let mcsApiSucessResponse: McsApiSuccessResponse<McsApiJob>;
            mcsApiSucessResponse = response;

            expect(response).toBeDefined();
            expect(mcsApiSucessResponse[0].status).toEqual(200);
            expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
            expect(mcsApiSucessResponse[0].content).toBeDefined();

            expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
            expect(mcsApiSucessResponse[0].content[0].status)
              .toEqual(CoreDefinition.NOTIFICATION_JOB_ACTIVE);
            expect(mcsApiSucessResponse[0].content[0].ownerName).toEqual('arrian');
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

      notificationsService.getNotification(requestOptions.id)
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
