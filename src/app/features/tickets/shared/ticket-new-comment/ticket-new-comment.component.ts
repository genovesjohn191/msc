import {
  OnInit,
  Component,
  Output,
  EventEmitter
} from '@angular/core';
import { isNullOrEmpty } from '../../../../utilities';
import {
  TicketNewComment,
  TicketFileInfo
} from '../../models';
import {
  McsTextContentProvider
} from '../../../../core';

@Component({
  selector: 'mcs-ticket-new-comment',
  templateUrl: './ticket-new-comment.component.html',
  host: { 'class' : 'block'}
})

export class TicketNewCommentComponent implements OnInit {

  public textContent: any;

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

  public constructor(private _textContentProvider: McsTextContentProvider) {
    this.onCreateComment = new EventEmitter<any>();
    this.onCancelComment = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.ticket;
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
