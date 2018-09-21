import {
  Observable,
  of
} from 'rxjs';
import {
  McsApiSuccessResponse,
  McsTicket
} from '@app/models';

export const mockTicketsService = {

  getTickets(
    _page?: number,
    _perPage?: number,
    _searchKeyword?: string): Observable<McsApiSuccessResponse<McsTicket[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsTicket[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array();

    let tickets = new McsTicket();
    tickets.id = '4';
    mcsApiResponseMock.content.push(tickets);
    tickets = new McsTicket();
    tickets.id = '5';
    mcsApiResponseMock.content.push(tickets);

    return of(mcsApiResponseMock);
  },

  getTicket(_id: any): Observable<McsApiSuccessResponse<McsTicket>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<McsTicket>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new McsTicket();

    let ticket = new McsTicket();
    ticket.id = '4';
    mcsApiResponseMock.content = ticket;

    return of(mcsApiResponseMock);
  }
};
