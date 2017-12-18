import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsLoggerService
} from '../../core';
import {
  reviverParser,
  convertJsonStringToObject,
  getEnumString,
  isNullOrEmpty
} from '../../utilities';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketSubType,
  TicketCreateAttachment,
  TicketCommentCategory,
  TicketAttachment,
  TicketCreate,
  TicketCreateComment,
  TicketCommentType,
  TicketComment,
} from './models';
import {
  Server,
  ServersService
} from '../servers';
import {
  Firewall,
  FirewallsService
} from '../networking';

@Injectable()
export class TicketsService {

  constructor(
    private _mcsApiService: McsApiService,
    private _serversService: ServersService,
    private _firewallsService: FirewallsService,
    private _loggerService: McsLoggerService
  ) { }

  /**
   * Get all the tickets from the API
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  public getTickets(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }): Observable<McsApiSuccessResponse<Ticket[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<Ticket[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<Ticket[]>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * Get all the servers from the API
   * @param pageIdx Page index of the page to obtained
   * @param perPageCount Size of item per page
   * @param keyword Keyword to be search during filtering
   */
  public getServers(
    pageIdx?: number,
    perPageCount?: number,
    keyword?: string): Observable<McsApiSuccessResponse<Server[]>> {
    return this._serversService.getServers({
      page: pageIdx,
      perPage: perPageCount,
      searchKeyword: keyword
    });
  }

  /**
   * Get all the firewalls from the API
   * @param pageIdx Page index of the page to obtained
   * @param perPageCount Size of item per page
   * @param keyword Keyword to be search during filtering
   */
  public getFirewalls(
    pageIdx?: number,
    perPageCount?: number,
    keyword?: string): Observable<McsApiSuccessResponse<Firewall[]>> {
    return this._firewallsService.getFirewalls({
      page: pageIdx,
      perPage: perPageCount,
      searchKeyword: keyword
    });
  }

  /**
   * Get the ticket from the API
   * @param id ID of the ticket to obtain
   */
  public getTicket(id: any): Observable<McsApiSuccessResponse<Ticket>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<Ticket>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<Ticket>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * This will create the new ticket based on the inputted information
   * @param ticketData Ticket data to be created
   */
  public createTicket(ticketData: TicketCreate):
    Observable<McsApiSuccessResponse<TicketCreate>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets`;
    mcsApiRequestParameter.recordData = JSON.stringify(ticketData, this._requestReviverParser);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<TicketCreate>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<TicketCreate>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * This will create the new comment based on the inputted information
   * @param commentData Comment data to be created
   */
  public createComment(ticketId: any, commentData: TicketCreateComment):
    Observable<McsApiSuccessResponse<TicketComment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/comments`;
    mcsApiRequestParameter.recordData = JSON.stringify(commentData, this._requestReviverParser);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<TicketComment>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<TicketComment>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * This will create the new attachment based on the inputted information
   * @param attachmentData Attachment data to be created
   */
  public createAttachment(ticketId: any, attachmentData: TicketCreateAttachment):
    Observable<McsApiSuccessResponse<TicketAttachment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/attachments`;
    mcsApiRequestParameter.recordData = JSON.stringify(attachmentData, this._requestReviverParser);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<TicketAttachment>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<TicketAttachment>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * Get the File attachment from API as Blob
   * @param ticketId ID of the ticket
   * @param attachmentId Attachment ID of the file
   */
  public getFileAttachment(ticketId: any, attachmentId: any): Observable<Blob> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/attachments/${attachmentId}/file`;
    mcsApiRequestParameter.responseType = 'blob';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, response);
        return response;
      });
  }

  /**
   * Convert the json object to corresponding object as response
   * by comparing its key
   * @param key Property name of the object to be change
   * @param value Value of the item
   */
  private _responseReviverParser(key, value): any {
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

      case 'category':
        value = TicketCommentCategory[value];
        break;

      default:
        value = reviverParser(key, value);
        break;
    }
    return value;
  }

  /**
   * Convert the json object to corresponding object as request
   * by comparing its key
   * @param key Property name of the object to be change
   * @param value Value of the item
   */
  private _requestReviverParser(key, value): any {
    switch (key) {
      case 'category':
        value = getEnumString(TicketCommentCategory, value);
        break;

      case 'type':
        value = getEnumString(TicketCommentType, value);
        break;

      case 'subType':
        value = getEnumString(TicketSubType, value);
        break;
      default:
        break;
    }
    return value;
  }
}
