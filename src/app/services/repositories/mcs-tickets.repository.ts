import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsTicket,
  McsTicketCreateComment,
  McsTicketComment,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsTicketCreate
} from '@app/models';
import { getSafeProperty } from '@app/utilities';
import {
  McsApiClientFactory,
  McsApiTicketsFactory,
  IMcsApiTicketsService
} from '@app/api-client';
import { McsTicketsDataContext } from '../data-context/mcs-tickets-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsTicketsRepository extends McsRepositoryBase<McsTicket> {
  private readonly _ticketsApiService: IMcsApiTicketsService;

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsTicketsDataContext(
      _apiClientFactory.getService(new McsApiTicketsFactory())
    ));
    this._ticketsApiService = _apiClientFactory.getService(new McsApiTicketsFactory());
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
