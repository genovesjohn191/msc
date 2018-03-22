import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { convertDateToStandardString } from '../../../../utilities';
import { CoreDefinition } from '../../../../core';
import {
  TicketActivity,
  TicketActivityType,
  TicketCommentType
} from '../../models';
import { TicketsService } from '../../tickets.service';
import { saveAs } from 'file-saver';

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
  /**
   * Activity of the ticket to be populated on the view
   */
  @Input()
  public get activity(): TicketActivity {
    return this._activity;
  }
  public set activity(value: TicketActivity) {
    if (this._activity !== value) {
      this._activity = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  @Input()
  public get ticketId(): TicketActivity {
    return this._ticketId;
  }
  public set ticketId(value: TicketActivity) {
    if (this._ticketId !== value) {
      this._ticketId = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get isWorkNotes(): boolean {
    return this.activity.commentType === TicketCommentType.WorkNotes;
  }

  private _ticketId: any;
  private _activity: TicketActivity;

  public get isAttachment(): boolean {
    return this.activity.type === TicketActivityType.Attachment;
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _ticketsService: TicketsService) {
    this._activity = new TicketActivity();
  }

  public get activityIconKey(): string {
    return this.activity.type === TicketActivityType.Comment ?
      CoreDefinition.ASSETS_FONT_COMMENT :
      CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  /**
   * Converts the date and time to string based on standard format
   * @param date Date to be converted
   */
  public convertDateTimeToString(date: Date): string {
    return convertDateToStandardString(date);
  }

  /**
   * Download the file attachment based on the blob
   * @param attachment Attachment information of the file to download
   */
  public downloadAttachment() {
    this.downloading = true;
    this._ticketsService.getFileAttachment(this._ticketId, this._activity.id)
      .subscribe((blobResponse) => {
        saveAs(blobResponse, this._activity.content);
        this.downloading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
}
