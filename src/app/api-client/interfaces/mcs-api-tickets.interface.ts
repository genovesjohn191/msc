import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsTicket,
  McsTicketCreate,
  McsTicketCreateComment,
  McsTicketComment,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsTicketQueryParams
} from '@app/models';

export interface IMcsApiTicketsService {

  /**
   * Get all the tickets from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getTickets(query?: McsTicketQueryParams): Observable<McsApiSuccessResponse<McsTicket[]>>;

  /**
   * Get the ticket from the API
   * @param id ID of the ticket to obtain
   */
  getTicket(id: any): Observable<McsApiSuccessResponse<McsTicket>>;

  /**
   * This will create the new ticket based on the inputted information
   * @param ticketData Ticket data to be created
   */
  createTicket(ticketData: McsTicketCreate): Observable<McsApiSuccessResponse<McsTicketCreate>>;

  /**
   * This will create the new comment based on the inputted information
   * @param commentData Comment data to be created
   */
  createComment(ticketId: any, commentData: McsTicketCreateComment):
    Observable<McsApiSuccessResponse<McsTicketComment>>;

  /**
   * This will create the new attachment based on the inputted information
   * @param attachmentData Attachment data to be created
   */
  createAttachment(ticketId: any, attachmentData: McsTicketCreateAttachment):
    Observable<McsApiSuccessResponse<McsTicketAttachment>>;

  /**
   * Get the File attachment from API as Blob
   * @param ticketId ID of the ticket
   * @param attachmentId Attachment ID of the file
   */
  getFileAttachment(ticketId: any, attachmentId: any): Observable<Blob>;
}
