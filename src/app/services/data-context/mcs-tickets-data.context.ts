import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsTicket,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { TicketsApiService } from '../api-services/tickets-api.service';

export class McsTicketsDataContext implements McsDataContext<McsTicket> {
  public totalRecordCount: number = 0;

  constructor(private _ticketsApiService: TicketsApiService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsTicket[]> {
    return this._ticketsApiService.getTickets().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsTicket> {
    return this._ticketsApiService.getTicket(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsTicket[]> {
    return this._ticketsApiService.getTickets(query).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Returns the API Content response on the map
   * @param apiResponse Api response from where the content will be obtained
   */
  private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
    if (isNullOrEmpty(apiResponse)) { return; }
    this.totalRecordCount = apiResponse.totalCount;
    return apiResponse.content;
  }
}
