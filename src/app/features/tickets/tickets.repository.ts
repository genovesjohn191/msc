import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { TicketsService } from './tickets.service';
import { Ticket } from './models';

@Injectable()
export class TicketsRepository extends McsRepositoryBase<Ticket> {

  constructor(private _ticketsApiService: TicketsService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(recordCount: number): Observable<McsApiSuccessResponse<Ticket[]>> {
    return this._ticketsApiService.getTickets({
      perPage: recordCount
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Ticket>> {
    return this._ticketsApiService.getTicket(recordId);
  }
}
