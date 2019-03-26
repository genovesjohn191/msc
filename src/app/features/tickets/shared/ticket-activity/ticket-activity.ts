import { TicketActivityType } from './ticket-activity-type.enum';
import {
  CommentType,
  McsTicketComment,
  McsTicketAttachment
} from '@app/models';

export class TicketActivity {

  /**
   * Creates a ticket activity by comment
   * @param comment Comment on where to get the data
   */
  public static createByComment(comment: McsTicketComment): TicketActivity {
    let activity = new TicketActivity();
    activity.id = comment.id;
    activity.header = comment.createdBy;
    activity.content = comment.value;
    activity.date = comment.createdOn;
    activity.type = TicketActivityType.Comment;
    activity.commentType = comment.type;

    return activity;
  }

  /**
   * Creates a ticket activity by attachment
   * @param attachment Attachment on where to get the data
   */
  public static createByAttachment(attachment: McsTicketAttachment): TicketActivity {
    let activity = new TicketActivity();
    activity.id = attachment.id;
    activity.header = attachment.createdBy;
    activity.content = attachment.fileName;
    activity.date = attachment.createdOn;
    activity.type = TicketActivityType.Attachment;

    return activity;
  }

  public id: string;
  public header: string;
  public content: string;
  public date: Date;
  public type: TicketActivityType;
  public commentType: CommentType;
}
