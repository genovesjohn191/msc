import { TicketActivityType } from './enumerations/ticket-activity-type';
import { TicketComment } from './response/ticket-comment';
import { TicketAttachment } from './response/ticket-attachment';

export class TicketActivity {
  public header: string;
  public content: string;
  public date: Date;
  public type: TicketActivityType;

  public setBasedOnComment(comment: TicketComment): void {
    this.header = comment.name;
    this.content = comment.value;
    this.date = comment.createdOn;
    this.type = TicketActivityType.Comment;
  }

  public setBasedOnAttachment(attachment: TicketAttachment) {
    this.header = attachment.createdBy;
    this.content = attachment.fileName;
    this.date = attachment.createdOn;
    this.type = TicketActivityType.Attachment;
  }
}
