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
  McsQueryParam,
  McsTicketQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiTicketsService } from '../interfaces/mcs-api-tickets.interface';

@Injectable()
export class McsApiTicketsService implements IMcsApiTicketsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getTickets(query?: McsTicketQueryParams): Observable<McsApiSuccessResponse<McsTicket[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/tickets';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

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

  public getFileAttachment(ticketId: any, attachmentId: any): Observable<Blob> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/tickets/${ticketId}/attachments/${attachmentId}/file`;
    mcsApiRequestParameter.responseType = 'blob';

    return this._mcsApiService.get(mcsApiRequestParameter);
  }
}
