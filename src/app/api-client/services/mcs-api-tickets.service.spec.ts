import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import {
  McsApiSuccessResponse,
  McsTicket
} from '@app/models';
import { McsApiTicketsService } from './mcs-api-tickets.service';
import { McsApiClientTestingModule } from '../testing';

describe('McsApiTicketsService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let ticketsService: McsApiTicketsService;
  let requestOptions = {
    page: 1,
    perPage: 10,
    searchKeyword: 'Arrian',
    id: 459
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

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      ticketsService = getTestBed().get(McsApiTicketsService);
    });
  }));

  /** Test Implementation */
  describe('getTickets()', () => {
    it('should get all tickets from API calls', () => {
      ticketsService.getTickets({
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
        `/tickets?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsTicket[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getTicket()', () => {
    it('should get the ticket based on ID from API calls', () => {
      ticketsService.getTicket(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/tickets/${requestOptions.id}`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsTicket>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });
});
