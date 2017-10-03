import {
  async,
  TestBed,
  getTestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  Response,
  RequestMethod
} from '@angular/http';
import {
  MockBackend,
  MockConnection
} from '@angular/http/testing';
import { ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import { ConsolePageService } from './console-page.service';
import {
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiConsole
} from '../../core';
import { ConsolePageTestingModule } from './testing';

describe('ConsoleService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let consoleService: ConsolePageService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        ConsolePageTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(MockBackend);
      consoleService = getTestBed().get(ConsolePageService);
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
        .subscribe(() => {
          // dummy subscribe to invoke exception
        });
    }));
  });
});
