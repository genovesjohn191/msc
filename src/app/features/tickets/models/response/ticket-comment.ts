import { TicketCommentType } from '../enumerations/ticket-comment-type';

export class TicketComment {
  public id: string;
  public name: string;
  public type: TicketCommentType;
  public createdBy: string;
  public createdOn: Date;
  public value: string;
}
