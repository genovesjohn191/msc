import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import {
  McsTicket,
  McsTicketCreateComment,
  McsTicketComment,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsTicketCreate
} from '@app/models';
import { getSafeProperty } from '@app/utilities';
import { TicketsApiService } from '../api-services/tickets-api.service';
import { McsTicketsDataContext } from '../data-context/mcs-tickets-data.context';

@Injectable()
export class McsTicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(private _ticketsApiService: TicketsApiService) {
    super(new McsTicketsDataContext(_ticketsApiService));
  }

  /**
   * Returns all the attached files on the ticket
   * @param ticketId Ticket ID to where to get the attachments
   * @param attachmentId Attachment Id on which attachment to get
   */
  public getFileAttachment(ticketId: string, attachmentId: string): Observable<Blob> {
    return this._ticketsApiService.getFileAttachment(ticketId, attachmentId);
  }

  /**
   * Creates a ticket based on the ticket data
   * @param ticketData Ticket data to be created
   */
  public createTicket(ticketData: McsTicketCreate): Observable<McsTicketCreate> {
    return this._ticketsApiService.createTicket(ticketData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
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
        this.addOrUpdate(activeTicket);
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
        this.addOrUpdate(activeTicket);
        return createdAttachment;
      })
    );
  }
}
