import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewContainerRef
} from '@angular/core';
import { convertDateToStandardString } from '../../../../utilities';
import { CoreDefinition } from '../../../../core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {
  TicketActivity,
  TicketActivityType,
  TicketNewComment
} from '../../models';

@Component({
  selector: 'mcs-ticket-new-comment',
  templateUrl: './ticket-new-comment.component.html',
  styles: [require('./ticket-new-comment.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketNewCommentComponent {

  public fileUploader: FileUploader;
  public hasDropZone: boolean;

  @Output()
  public onCreateComment: EventEmitter<any>;

  @Output()
  public onCancelComment: EventEmitter<any>;

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

  public constructor(
    private _viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.onCreateComment = new EventEmitter<any>();
    this.onCancelComment = new EventEmitter<any>();
    // Set uploader configuration
    this.fileUploader = new FileUploader({
      autoUpload: false
    });
  }

  public get hasAttachment(): boolean {
    return this.fileUploader && this.fileUploader.queue.length > 0;
  }

  public get attachmentFile(): FileItem {
    return this.fileUploader.queue ?
      this.fileUploader.queue[this.fileUploader.queue.length - 1] :
      undefined;
  }

  public onFileOver(event: any) {
    this.hasDropZone = event;
  }

  public cancelComment() {
    this.onCancelComment.emit(true);
  }

  public createComment() {
    let details = new TicketNewComment();

    details.comment = this.comment;
    details.attachedFile = this.attachmentFile;
    this.onCreateComment.emit(details);
  }
}
