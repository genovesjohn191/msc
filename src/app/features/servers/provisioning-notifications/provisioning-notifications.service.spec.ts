import {
  async,
  TestBed,
  getTestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  Response,
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
import { ProvisioningNotificationsService } from './provisioning-notifications.service';
import {
  McsApiSuccessResponse,
  McsApiErrorResponse,
  CoreDefinition,
  McsApiJob
} from '../../../core';
import { ServersTestingModule } from '../testing';

describe('ProvisioningNotificationsService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let provisioningNotificationsService: ProvisioningNotificationsService;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        ServersTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(MockBackend);
      provisioningNotificationsService = getTestBed().get(ProvisioningNotificationsService);
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
        provisioningNotificationsService.getNotifications(requestOptions.page,
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

      provisioningNotificationsService.getNotifications(
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
});
