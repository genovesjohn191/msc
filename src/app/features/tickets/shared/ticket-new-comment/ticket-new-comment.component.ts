import {
  OnInit,
  Component,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { isNullOrEmpty } from '../../../../utilities';
import { TicketNewComment } from '../../models';
import {
  McsTextContentProvider,
  McsAttachment,
  CoreValidators
} from '../../../../core';

@Component({
  selector: 'mcs-ticket-new-comment',
  templateUrl: './ticket-new-comment.component.html',
  host: { 'class' : 'block'}
})

export class TicketNewCommentComponent implements OnInit {

  public textContent: any;
  public fgCreateComment: FormGroup;
  public fcComment: FormControl;

  @Output()
  public onCreateComment: EventEmitter<any>;

  @Output()
  public onCancelComment: EventEmitter<any>;

  private _attachedFile: McsAttachment;

  public constructor(private _textContentProvider: McsTextContentProvider) {
    this.onCreateComment = new EventEmitter<any>();
    this.onCancelComment = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.ticket;
    this._registerFormGroup();
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
  public onChangedAttachments(attachments: McsAttachment[]): void {
    if (isNullOrEmpty(attachments)) { return; }
    this._attachedFile = attachments[0];
  }

  /**
   * Create comment based on the details and attachment
   */
  public createComment() {
    let details = new TicketNewComment();

    details.comment = this.fcComment.value;
    details.attachedFile = this._attachedFile;
    this.onCreateComment.emit(details);
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    this.fcComment = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgCreateComment = new FormGroup({
      fcComment: this.fcComment
    });
  }
}
