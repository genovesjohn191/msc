import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsTicket,
  McsTicketCreateComment,
  McsTicketComment,
  McsTicketCreateAttachment,
  McsTicketAttachment
} from '@app/models';
import { TicketsApiService } from '../api-services/tickets-api.service';
import { map } from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';

@Injectable()
export class TicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(private _ticketsApiService: TicketsApiService) {
    super();
  }

  /**
   * Returns all the attached files on the ticket
   * @param ticketId Ticket ID to where to get the attachments
   * @param attachmentId Attachment Id on which attachment to get
   */
  public findFileAttachment(ticketId: string, attachmentId: string): Observable<Blob> {
    return this._ticketsApiService.getFileAttachment(ticketId, attachmentId);
  }

  /**
   * Creates a comment on the active ticket provided
   * @param activeTicket Active ticket where the comment will be attached
   * @param commentData Comment data to be attached
   */
  public createComment(
    activeTicket: McsTicket,
    commentData: McsTicketCreateComment
  ): Observable<McsTicketComment> {
    return this._ticketsApiService.createComment(activeTicket.id, commentData).pipe(
      map((response) => {
        let createdComment = getSafeProperty(response, (obj) => obj.content);
        activeTicket.comments.push(createdComment);
        this.updateRecord(activeTicket);
        return createdComment;
      })
    );
  }

  /**
   * Creates an attachment on the active ticket provided
   * @param activeTicket Active ticket where the attachment will be attached
   * @param attachmentData Attachment data to be attached
   */
  public createAttachment(
    activeTicket: McsTicket,
    attachmentData: McsTicketCreateAttachment
  ): Observable<McsTicketAttachment> {
    return this._ticketsApiService.createAttachment(activeTicket.id, attachmentData).pipe(
      map((response) => {
        let createdAttachment = getSafeProperty(response, (obj) => obj.content);
        activeTicket.attachments.push(createdAttachment);
        this.updateRecord(activeTicket);
        return createdAttachment;
      })
    );
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
