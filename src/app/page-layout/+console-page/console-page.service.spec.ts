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
import {
  Observable,
  Subject
} from 'rxjs/Rx';
/** Services and Models */
import { ConsoleService } from './console-page.service';
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiConsole,
  CoreConfig
} from '../../core';
import { AppState } from '../../app.service';

describe('ConsoleService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let mcsApiService: McsApiService;
  let consoleService: ConsoleService;
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
        ConsoleService,
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
      consoleService = getTestBed().get(ConsoleService);
    });
  }));

  /** Test Implementation */
  describe('getServerConsole()', () => {
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
                    url: 'http://192.168.1.1/console',
                    vmx: 'aacsdftyAAABBBggguuu'
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<ServerConsole> when successful',
      fakeAsync(() => {
        consoleService.getServerConsole(requestOptions.id)
          .subscribe((response) => {
            let mcsApiSucessResponse: McsApiSuccessResponse<McsApiConsole>;
            mcsApiSucessResponse = response;

            expect(response).toBeDefined();
            expect(mcsApiSucessResponse[0].status).toEqual(200);
            expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
            expect(mcsApiSucessResponse[0].content).toBeDefined();

            expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
            expect(mcsApiSucessResponse[0].content[0].url).toEqual('http://192.168.1.1/console');
            expect(mcsApiSucessResponse[0].content[0].vmx).toEqual('aacsdftyAAABBBggguuu');
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

      consoleService.getServerConsole(requestOptions.id)
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
