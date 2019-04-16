import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsTicket,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsTicketCreate,
  McsTicketCreateComment,
  McsTicketComment,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiTicketsService } from '../interfaces/mcs-api-tickets.interface';

@Injectable()
export class McsApiTicketsService implements IMcsApiTicketsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get all the tickets from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getTickets(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTicket[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicket[]>(McsTicket, response);
          return apiResponse;
        })
      );
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
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicket>(McsTicket, response);
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
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketCreate>(McsTicketCreate, response);
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
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketComment>(McsTicketComment, response);
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
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTicketAttachment>(McsTicketAttachment, response);
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

    return this._mcsApiService.get(mcsApiRequestParameter);
  }
}
