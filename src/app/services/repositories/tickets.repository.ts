import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsTicket
} from '@app/models';
import { TicketsApiService } from '../api-services/tickets-api.service';

@Injectable()
export class TicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(private _ticketsApiService: TicketsApiService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsTicket[]>> {
    return this._ticketsApiService.getTickets({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsTicket>> {
    return this._ticketsApiService.getTicket(recordId);
  }
}
