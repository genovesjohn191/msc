import { TicketCommentType } from '../enumerations/ticket-comment-type';
import { TicketCommentCategory } from '../enumerations/ticket-comment-category';

export class TicketComment {
  public id: string;
  public category: TicketCommentCategory;
  public type: TicketCommentType;
  public createdBy: string;
  public createdOn: Date;
  public value: string;
}
