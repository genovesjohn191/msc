import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { saveAs } from 'file-saver';
import { CoreDefinition } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  CommentType,
  McsTicketComment,
  McsTicketAttachment
} from '@app/models';
import { TicketActivity } from './ticket-activity';
import { TicketActivityType } from './ticket-activity-type.enum';

@Component({
  selector: 'mcs-ticket-activity',
  templateUrl: './ticket-activity.component.html',
  styleUrls: ['./ticket-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ticket-activity-wrapper',
    '[class.worknotes]': 'isWorkNotes'
  }
})

export class TicketActivityComponent {
  public downloading: boolean;

  @Input()
  public ticketId: string;

  @Input()
  public set activity(value: McsTicketComment | McsTicketAttachment) {
    if (isNullOrEmpty(value)) { return; }
    this._activity = value instanceof McsTicketComment ?
      TicketActivity.createByComment(value) :
      TicketActivity.createByAttachment(value);
  }
  private _activity: TicketActivity;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) { }

  public get activityIconKey(): string {
    return this._activity.type === TicketActivityType.Comment ?
      CoreDefinition.ASSETS_FONT_COMMENT :
      CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  /**
   * Returns the ticket activity
   */
  public get ticketActivity(): TicketActivity {
    return this._activity;
  }

  /**
   * Returns true when the activity is an attachment type
   */
  public get isAttachment(): boolean {
    return this._activity.type === TicketActivityType.Attachment;
  }

  /**
   * Returns true when the comment type is work notes
   */
  public get isWorkNotes(): boolean {
    return this._activity.commentType === CommentType.WorkNotes;
  }

  /**
   * Download the file attachment based on the blob
   * @param attachment Attachment information of the file to download
   */
  public downloadAttachment() {
    this.downloading = true;
    this._apiService.getFileAttachment(
      this.ticketId, this._activity.id
    ).subscribe((blobResponse) => {
      saveAs(blobResponse, this._activity.content);
      this.downloading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
