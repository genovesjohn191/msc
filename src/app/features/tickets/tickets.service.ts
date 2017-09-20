import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter
} from '../../core';
import {
  reviverParser,
  convertJsonStringToObject
} from '../../utilities';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketSubType
} from './models';

@Injectable()
export class TicketsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get all the tickets from the API
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  public getTickets(
    page?: number,
    perPage?: number,
    searchKeyword?: string): Observable<McsApiSuccessResponse<Ticket[]>> {

    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<Ticket[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<Ticket[]>>(
          response.text(),
          this._convertProperty
        );

        return apiResponse;
      })
      .catch(this._handleApiResponseError);
  }

  /**
   * Get the ticket from the API
   * @param id ID of the ticket to obtain
   */
  public getTicket(id: any): Observable<McsApiSuccessResponse<Ticket>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let notificationsJobResponse: McsApiSuccessResponse<Ticket[]>;
        notificationsJobResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<Ticket[]>;

        return notificationsJobResponse;
      })
      .catch(this._handleApiResponseError);
  }

  /**
   * This will handle all error that correspond to HTTP request
   * @param error Error obtained
   */
  private _handleApiResponseError(error: Response | any) {
    let mcsApiErrorResponse: McsApiErrorResponse;

    if (error instanceof Response) {
      mcsApiErrorResponse = new McsApiErrorResponse();
      mcsApiErrorResponse.message = error.statusText;
      mcsApiErrorResponse.status = error.status;
    } else {
      mcsApiErrorResponse = error;
    }

    return Observable.throw(mcsApiErrorResponse);
  }

  /**
   * Convert the json object to corresponding object
   * by comparing its key
   * @param key Property name of the object to be change
   * @param value Value of the item
   */
  private _convertProperty(key, value): any {
    switch (key) {
      case 'subType':
        value = TicketSubType[value];
        break;

      case 'state':
        value = TicketStatus[value];
        break;

      case 'priority':
        value = TicketPriority[value];
        break;

      default:
        value = reviverParser(key, value);
        break;
    }
    return value;
  }
}
