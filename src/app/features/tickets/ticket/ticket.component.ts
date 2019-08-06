import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  finalize,
  map,
  shareReplay
} from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { CoreDefinition } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  CommentCategory,
  CommentType,
  McsFileInfo,
  McsComment,
  McsTicket,
  TicketSubType,
  ticketSubTypeText,
  McsTicketAttachment,
  McsTicketCreateComment,
  McsTicketCreateAttachment
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketComponent implements OnInit, OnDestroy {

  public selectedTicket$: Observable<McsTicket>;

  private _downloadingIdList: Set<string>;
  private _ticketDetailsChange = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _ticketsDataChangeHandler: Subscription;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._downloadingIdList = new Set();
  }

  public ngOnInit() {
    this._subscribeToTicketResolve();
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._ticketDetailsChange);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._ticketsDataChangeHandler);
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns the formatted ticket header by subtype and crisp ticket number
   */
  public getTicketHeader(ticket: McsTicket): string {
    if (isNullOrEmpty(ticket)) { return ''; }
    return `${ticket.subTypeLabel} #${ticket.crispTicketNumber}`;
  }

  /**
   * Return the subtype string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getSubTypeString(status: TicketSubType) {
    return ticketSubTypeText[status];
  }

  /**
   * Returns true when the attachment is currently downloading
   * @param attachmentId Attachment Id to be checked
   */
  public isDownloading(attachmentId: string): boolean {
    return this._downloadingIdList.has(attachmentId);
  }

  /**
   * Download the file attachment based on the blob
   * @param activeTicket The active ticket where the attachment would be downloaded
   * @param attachment Attachment information of the file to download
   */
  public downloadAttachment(activeTicket: McsTicket, attachment: McsTicketAttachment) {
    if (isNullOrEmpty(attachment)) { return; }
    this._downloadingIdList.add(attachment.id);

    this._apiService.getFileAttachment(activeTicket.id, attachment.id)
      .pipe(
        finalize(() => {
          this._downloadingIdList.delete(attachment.id);
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe((blobResponse) => {
        saveAs(blobResponse, attachment.fileName);
      });
  }

  /**
   * Create the whole comment including attachment
   * @param activeTicket The active ticket where the comment should be appended
   * @param comment Comment information details
   */
  public createComment(activeTicket: McsTicket, comment: McsComment) {
    if (isNullOrEmpty(comment)) { return; }
    this._createCommentContent(activeTicket, comment.message);

    if (!isNullOrEmpty(comment.attachments)) {
      comment.attachments.forEach((attachment) => {
        this._createAttachment(activeTicket, attachment);
      });
    }
  }

  /**
   * Creates a comment on the ticket
   * @param activeTicket The active ticket where the comment should be appended
   */
  private _createCommentContent(activeTicket: McsTicket, content: string) {
    if (isNullOrEmpty(content)) { return; }
    let newComment = new McsTicketCreateComment();
    newComment.category = CommentCategory.Task;
    newComment.type = CommentType.Comments;
    newComment.value = content;

    this._apiService.createTicketComment(activeTicket.id, newComment).pipe(
      finalize(() => {
        this._ticketDetailsChange.next();
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  /**
   * Creates attachment based on the ticket id
   * @param activeTicket The active ticket where the attachment should be appended
   * @param attachedFile Attachment to be created
   */
  private _createAttachment(activeTicket: McsTicket, attachedFile: McsFileInfo) {
    if (isNullOrEmpty(attachedFile)) { return; }
    let newAttachment = new McsTicketCreateAttachment();
    newAttachment.fileName = attachedFile.filename;
    newAttachment.contents = attachedFile.base64Contents;

    this._apiService.createTicketAttachment(activeTicket.id, newAttachment).pipe(
      finalize(() => {
        this._ticketDetailsChange.next();
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  /**
   * Subscribe to ticket resolver
   */
  private _subscribeToTicketResolve(): void {
    this.selectedTicket$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.ticket)),
      shareReplay(1)
    );
  }

  /**
   * Registers the associated events
   */
  private _registerEvents(): void {
    this._ticketsDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeTickets, () => this._changeDetectorRef.markForCheck());
  }
}
