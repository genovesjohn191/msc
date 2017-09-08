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
import { Ticket } from './models';
import { TicketsService } from './tickets.service';
import {
  McsApiSuccessResponse,
  McsApiErrorResponse
} from '../../core';
import { TicketsTestingModule } from './testing';

describe('TicketsService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let ticketsService: TicketsService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        TicketsTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mockBackend = getTestBed().get(MockBackend);
      ticketsService = getTestBed().get(TicketsService);
    });
  }));

  /** Test Implementation */

  /**
   * Get Tickets Test
   */
  describe('getTickets()', () => {
    let requestOptions = {
      page: 1,
      perPage: 10,
      searchKeyword: 'Arrian'
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
                    number: '123',
                    requestor: 'Arrian'
                  },
                  {
                    id: 2,
                    number: '124',
                    requestor: 'Pascual'
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

    it('should map response to McsApiSuccessResponse<Ticket[]> when successful', fakeAsync(() => {
      ticketsService
        .getTickets(requestOptions.page, requestOptions.perPage, requestOptions.searchKeyword)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Ticket[]>;
          mcsApiSucessResponse = response[0];

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse.status).toEqual(200);
          expect(mcsApiSucessResponse.totalCount).toEqual(2);
          expect(mcsApiSucessResponse.content).toBeDefined();

          expect(mcsApiSucessResponse.content[0].id).toEqual(1);
          expect(mcsApiSucessResponse.content[0].number).toEqual('123');
          expect(mcsApiSucessResponse.content[0].requestor).toEqual('Arrian');

          expect(mcsApiSucessResponse.content[1].id).toEqual(2);
          expect(mcsApiSucessResponse.content[1].number).toEqual('124');
          expect(mcsApiSucessResponse.content[1].requestor).toEqual('Pascual');
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

      ticketsService.getTickets(
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

  /**
   * Get Ticket test
   */
  describe('getTicket()', () => {
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
                    number: '12345',
                    requestor: 'Arrian'
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Ticket> when successful', fakeAsync(() => {
      ticketsService.getTicket(requestOptions.id)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Ticket>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
          expect(mcsApiSucessResponse[0].content[0].number).toEqual('12345');
          expect(mcsApiSucessResponse[0].content[0].requestor).toEqual('Arrian');
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

      ticketsService.getTicket(requestOptions.id)
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
