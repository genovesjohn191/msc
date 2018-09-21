import { TicketActivityType } from './ticket-activity-type.enum';
import {
  CommentType,
  McsTicketComment,
  McsTicketAttachment
} from '@app/models';

export class TicketActivity {
  public id: string;
  public header: string;
  public content: string;
  public date: Date;
  public type: TicketActivityType;
  public commentType: CommentType;

  public setBasedOnComment(comment: McsTicketComment): void {
    this.id = comment.id;
    this.header = comment.createdBy;
    this.content = comment.value;
    this.date = comment.createdOn;
    this.type = TicketActivityType.Comment;
    this.commentType = comment.type;
  }

  public setBasedOnAttachment(attachment: McsTicketAttachment) {
    this.id = attachment.id;
    this.header = attachment.createdBy;
    this.content = attachment.fileName;
    this.date = attachment.createdOn;
    this.type = TicketActivityType.Attachment;
  }
}
