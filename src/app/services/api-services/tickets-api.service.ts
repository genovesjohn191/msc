import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  finalize
} from 'rxjs/operators';
/** Services and Models */
import {
  McsApiService,
  McsLoggerService
} from '@app/core';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsFirewall,
  McsTicket,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsTicketCreate,
  McsTicketCreateComment,
  McsTicketComment,
  McsResource,
  McsServer
} from '@app/models';
import { ResourcesRepository } from '../repositories/resources.repository';
import { ServersRepository } from '../repositories/servers.repository';
import { FirewallsRepository } from '../repositories/firewalls.repository';

@Injectable()
export class TicketsApiService {

  constructor(
    private _mcsApiService: McsApiService,
    private _resourcesRepository: ResourcesRepository,
    private _serversRespository: ServersRepository,
    private _firewallsRepository: FirewallsRepository,
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
  }): Observable<McsApiSuccessResponse<McsTicket[]>> {

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
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicket[]>(McsTicket, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get all server resources from the API
   */
  public getServerResources(): Observable<McsResource[]> {
    return this._resourcesRepository.findAllRecords();
  }

  /**
   * Get all the servers from the API
   * @param pageIdx Page index of the page to obtained
   * @param perPageCount Size of item per page
   * @param keyword Keyword to be search during filtering
   */
  public getServers(): Observable<McsServer[]> {
    return this._serversRespository.findAllRecords();
  }

  /**
   * Get all the firewalls from the API
   * @param pageIdx Page index of the page to obtained
   * @param perPageCount Size of item per page
   * @param keyword Keyword to be search during filtering
   */
  public getFirewalls(): Observable<McsFirewall[]> {
    return this._firewallsRepository.findAllRecords();
  }

  /**
   * Get the ticket from the API
   * @param id ID of the ticket to obtain
   */
  public getTicket(id: any): Observable<McsApiSuccessResponse<McsTicket>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicket>(McsTicket, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new ticket based on the inputted information
   * @param ticketData Ticket data to be created
   */
  public createTicket(ticketData: McsTicketCreate):
    Observable<McsApiSuccessResponse<McsTicketCreate>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(ticketData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketCreate>(McsTicketCreate, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new comment based on the inputted information
   * @param commentData Comment data to be created
   */
  public createComment(ticketId: any, commentData: McsTicketCreateComment):
    Observable<McsApiSuccessResponse<McsTicketComment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/comments`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(commentData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketComment>(McsTicketComment, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new attachment based on the inputted information
   * @param attachmentData Attachment data to be created
   */
  public createAttachment(ticketId: any, attachmentData: McsTicketCreateAttachment):
    Observable<McsApiSuccessResponse<McsTicketAttachment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/attachments`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(attachmentData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketAttachment>(McsTicketAttachment, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
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
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, response);
          return response;
        })
      );
  }
}
