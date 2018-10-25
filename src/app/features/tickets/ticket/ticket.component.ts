import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
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
  switchMap,
  finalize,
  shareReplay,
  startWith,
  map
} from 'rxjs/operators';
import { saveAs } from 'file-saver';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreRoutes,
  McsLoadingService
} from '@app/core';
import {
  isNullOrEmpty,
  compareDates,
  unsubscribeSafely
} from '@app/utilities';
import {
  CommentCategory,
  CommentType,
  McsFileInfo,
  McsComment,
  RouteKey,
  McsTicket,
  TicketSubType,
  ticketSubTypeText,
  McsTicketAttachment,
  McsTicketCreateComment,
  McsTicketCreateAttachment
} from '@app/models';
import { TicketsRepository } from '@app/services';
import { TicketActivity } from '../shared';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketComponent implements OnInit, OnDestroy {

  public textContent: any;
  public selectedTicket$: Observable<McsTicket>;
  public ticketActivites$: Observable<TicketActivity[]>;
  public creatingComment$: Observable<boolean>;

  private _downloadingIdList: Set<string>;
  private _creatingComment = new Subject<boolean>();
  private _ticketDetailsChange = new Subject<void>();

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _ticketsRepository: TicketsRepository,
    private _loadingService: McsLoadingService,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._downloadingIdList = new Set();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.ticket;
    this.creatingComment$ = this._creatingComment;
    this._subscribeToParamId();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._ticketDetailsChange);
    unsubscribeSafely(this._creatingComment);
  }

  /**
   * Returns the formatted ticket header by subtype and crisp ticket number
   */
  public getTicketHeader(ticket: McsTicket): string {
    if (isNullOrEmpty(ticket)) { return ''; }
    return `${ticket.subTypeLabel} #${ticket.crispTicketNumber}`;
  }

  /**
   * Navigate to ticket listing
   */
  public gotoTickets(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Tickets)]);
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

    this._ticketsRepository.findFileAttachment(activeTicket.id, attachment.id)
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
    this._activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let ticketId = params.get('id');
      this._subscribeToTicketById(ticketId);
      this._subscribeToSelectedTicket();
    });
  }

  /**
   * Subscribe to ticket based on the parameter ID
   */
  private _subscribeToTicketById(ticketId: string): void {
    this._loadingService.showLoader(this.textContent.loading);
    this.selectedTicket$ = this._ticketDetailsChange.pipe(
      startWith(null),
      switchMap(() =>
        this._ticketsRepository.findRecordById(ticketId).pipe(
          catchError((error) => {
            this._errorHandlerService.handleHttpRedirectionError(error.status);
            return throwError(error);
          }),
          finalize(() => this._loadingService.hideLoader())
        )
      ),
      shareReplay(1)
    );
  }

  /**
   * Subscribes to the selected ticket and always notifies
   * the changes once the ticket details has been triggered
   */
  private _subscribeToSelectedTicket(): void {
    this.ticketActivites$ = this._ticketDetailsChange.pipe(
      startWith(null),
      switchMap(() => {
        return this.selectedTicket$.pipe(
          map((ticketDetails) => {
            let ticketActivities: TicketActivity[] = new Array();

            // Add attachment to the activity list
            ticketDetails.attachments.forEach((ticketAttachment) => {
              let activity = new TicketActivity();
              activity.setBasedOnAttachment(ticketAttachment);
              ticketActivities.push(activity);
            });

            // Add comments to the activity list
            ticketDetails.comments.forEach((ticketItem) => {
              let activity = new TicketActivity();
              activity.setBasedOnComment(ticketItem);
              ticketActivities.push(activity);
            });

            // Sort activities by date
            ticketActivities.sort((_first: TicketActivity, _second: TicketActivity) => {
              return compareDates(_second.date, _first.date);
            });
            return ticketActivities;
          })
        );
      }),
      shareReplay(1)
    );
  }
}
