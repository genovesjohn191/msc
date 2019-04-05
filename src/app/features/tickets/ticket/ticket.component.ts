import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  finalize,
  takeUntil
} from 'rxjs/operators';
import { saveAs } from 'file-saver';
import {
  CoreDefinition,
  McsErrorHandlerService,
  McsLoadingService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
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
import { McsTicketsRepository } from '@app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketComponent implements OnInit, OnDestroy {

  public selectedTicket$: Observable<McsTicket>;
  public creatingComment$: Observable<boolean>;

  private _downloadingIdList: Set<string>;
  private _creatingComment = new Subject<boolean>();
  private _ticketDetailsChange = new Subject<void>();
  private _destroySubject = new Subject<void>();

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public constructor(
    private _translateService: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _ticketsRepository: McsTicketsRepository,
    private _loadingService: McsLoadingService,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._downloadingIdList = new Set();
  }

  public ngOnInit() {
    this.creatingComment$ = this._creatingComment;
    this._subscribeToTicketsDataChange();
    this._subscribeToParamId();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._ticketDetailsChange);
    unsubscribeSafely(this._creatingComment);
    unsubscribeSafely(this._destroySubject);
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

    this._ticketsRepository.getFileAttachment(activeTicket.id, attachment.id)
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
    this._creatingComment.next(true);
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

    this._ticketsRepository.createComment(activeTicket, newComment).pipe(
      finalize(() => {
        this._creatingComment.next(false);
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

    this._ticketsRepository.createAttachment(activeTicket, newAttachment).pipe(
      finalize(() => {
        this._ticketDetailsChange.next();
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  /**
   * Subscribes to parameter id
   */
  private _subscribeToParamId(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject)
    ).subscribe((params: ParamMap) => {
      let ticketId = params.get('id');
      this._subscribeToTicketById(ticketId);
    });
  }

  /**
   * Subscribe to ticket based on the parameter ID
   */
  private _subscribeToTicketById(ticketId: string): void {
    this._loadingService.showLoader(this._translateService.instant('ticket.loading'));

    this.selectedTicket$ = this._ticketsRepository.getByIdAsync(
      ticketId, this._onTicketObtained.bind(this)
    ).pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
  }

  /**
   * Subscribes to ticket data change
   */
  private _subscribeToTicketsDataChange(): void {
    this._ticketsRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  /**
   * Event that emits when the ticket has been completed
   */
  private _onTicketObtained(): void {
    this._loadingService.hideLoader();
  }
}
