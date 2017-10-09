import {
  Component,
  Output,
  EventEmitter
} from '@angular/core';
import { isNullOrEmpty } from '../../../../utilities';
import {
  TicketNewComment,
  TicketFileInfo
} from '../../models';

@Component({
  selector: 'mcs-ticket-new-comment',
  templateUrl: './ticket-new-comment.component.html',
  styleUrls: ['./ticket-new-comment.component.scss']
})

export class TicketNewCommentComponent {

  @Output()
  public onCreateComment: EventEmitter<any>;

  @Output()
  public onCancelComment: EventEmitter<any>;

  private _attachedFile: TicketFileInfo;

  /**
   * Comment of the text area
   */
  private _comment: string;
  public get comment(): string {
    return this._comment;
  }
  public set comment(value: string) {
    this._comment = value;
  }

  public constructor() {
    this.onCreateComment = new EventEmitter<any>();
    this.onCancelComment = new EventEmitter<any>();
  }

  /**
   * Cancel the comment data information
   */
  public cancelComment() {
    this.onCancelComment.emit(true);
  }

  /**
   * Notify when there are changes on the attachment
   * @param attachments Attachment to be part of the comment
   */
  public onChangedAttachments(attachments: TicketFileInfo[]): void {
    if (isNullOrEmpty(attachments)) { return; }
    this._attachedFile = attachments[0];
  }

  /**
   * Create comment based on the details and attachment
   */
  public createComment() {
    let details = new TicketNewComment();

    details.comment = this.comment;
    details.attachedFile = this._attachedFile;
    this.onCreateComment.emit(details);
  }
}
