import { TicketActivityType } from './enumerations/ticket-activity-type';
import { TicketCommentType } from './enumerations/ticket-comment-type';
import { TicketComment } from './response/ticket-comment';
import { TicketAttachment } from './response/ticket-attachment';

export class TicketActivity {
  public id: string;
  public header: string;
  public content: string;
  public date: Date;
  public type: TicketActivityType;
  public commentType: TicketCommentType;

  public setBasedOnComment(comment: TicketComment): void {
    this.id = comment.id;
    this.header = comment.createdBy;
    this.content = comment.value;
    this.date = comment.createdOn;
    this.type = TicketActivityType.Comment;
    this.commentType = comment.type;
  }

  public setBasedOnAttachment(attachment: TicketAttachment) {
    this.id = attachment.id;
    this.header = attachment.createdBy;
    this.content = attachment.fileName;
    this.date = attachment.createdOn;
    this.type = TicketActivityType.Attachment;
  }
}
