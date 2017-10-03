import { Observable } from 'rxjs/Rx';
import { McsApiSuccessResponse } from '../../../core';
import { Ticket } from '../models';

export const mockTicketsService = {

  getTickets(
    _page?: number,
    _perPage?: number,
    _searchKeyword?: string): Observable<McsApiSuccessResponse<Ticket[]>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Ticket[]>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Array();

    let tickets = new Ticket();
    tickets.id = '4';
    mcsApiResponseMock.content.push(tickets);
    tickets = new Ticket();
    tickets.id = '5';
    mcsApiResponseMock.content.push(tickets);

    return Observable.of(mcsApiResponseMock);
  },

  getTicket(_id: any): Observable<McsApiSuccessResponse<Ticket>> {

    let mcsApiResponseMock = new McsApiSuccessResponse<Ticket>();
    mcsApiResponseMock.status = 200;
    mcsApiResponseMock.totalCount = 2;
    mcsApiResponseMock.content = new Ticket();

    let ticket = new Ticket();
    ticket.id = '4';
    mcsApiResponseMock.content = ticket;

    return Observable.of(mcsApiResponseMock);
  }
};
