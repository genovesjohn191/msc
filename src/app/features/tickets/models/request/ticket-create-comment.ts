import { TicketCommentType } from '../enumerations/ticket-comment-type';
import { TicketCommentCategory } from '../enumerations/ticket-comment-category';

export class TicketCreateComment {
  public category: TicketCommentCategory;
  public type: TicketCommentType;
  public value: string;
}
