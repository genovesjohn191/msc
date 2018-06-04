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
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsFileInfo,
  McsComment,
  McsErrorHandlerService
} from '../../../core';
import {
  isNullOrEmpty,
  compareDates,
  replacePlaceholder,
  unsubscribeSafely
} from '../../../utilities';
import {
  Ticket,
  TicketStatus,
  ticketStatusText,
  TicketSubType,
  ticketSubTypeText,
  TicketAttachment,
  TicketActivity,
  TicketCommentCategory,
  TicketCommentType,
  TicketCreateComment,
  TicketCreateAttachment
} from '../models';
import { TicketsService } from '../tickets.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketComponent implements OnInit, OnDestroy {

  public textContent: any;
  public ticketSubscription: any;
  public createCommentSubscription: any;
  public createAttachmentSubscription: any;
  public enumDefinition: any;

  /**
   * An observable ticket data that obtained based on the given id
   */
  private _ticket: Ticket;
  public get ticket(): Ticket {
    return this._ticket;
  }
  public set ticket(value: Ticket) {
    if (this._ticket !== value) {
      unsubscribeSafely(this.ticketSubscription);

      this._ticket = value;
      this._setActivities(this._ticket);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * List of activities of the ticket
   */
  private _activities: TicketActivity[];
  public get activities(): TicketActivity[] {
    return this._activities;
  }
  public set activities(value: TicketActivity[]) {
    if (this._activities !== value) {
      this._activities = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get ticketResolved(): boolean {
    return isNullOrEmpty(this.ticket) ? false : this.ticket.state === TicketStatus.Resolved;
  }

  public get ticketHeader(): string {
    let subTypeEnumValue = isNullOrEmpty(this.ticket) ? '' : this.ticket.subType;

    if (isNullOrEmpty(subTypeEnumValue)) { return ''; }

    let enumTextValue = this.enumDefinition.ticketSubType[subTypeEnumValue];
    let ticketTypeValue = isNullOrEmpty(enumTextValue) ?
      '' : replacePlaceholder(this.textContent.header, 'ticketType', enumTextValue);

    return `${ticketTypeValue}${this.ticket.crispTicketNumber}`;
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get userIconKey(): string {
    return CoreDefinition.ASSETS_FONT_USER;
  }

  public get attachmentIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public get requestor(): string {
    return isNullOrEmpty(this.ticket) || isNullOrEmpty(this.ticket.requestor)
      ? `${this.textContent.missingRequestorLabel}`
      : `${this.ticket.requestor}`;
  }

  public get missingServices(): boolean {
    return isNullOrEmpty(this.ticket.serviceId);
  }

  public get missingAttachments(): boolean {
    return isNullOrEmpty(this.ticket.attachments);
  }

  public get missingActivities(): boolean {
    return isNullOrEmpty(this.activities);
  }

  public constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _ticketsService: TicketsService,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._ticket = new Ticket();
    this._activities = new Array();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.ticket;
    this.enumDefinition = this._textContentProvider.content.enumerations;
    // Get ticket data by ID
    this._getTicketById();
  }

  public ngOnDestroy() {
    // We just want to make sure that the subscription is empty
    unsubscribeSafely(this.ticketSubscription);
  }

  /**
   * Navigate to ticket listing
   */
  public gotoTickets(): void {
    this._router.navigate(['/tickets']);
  }

  /**
   * Track by function to help determine the view which data has beed modified
   * @param index Index of the current loop
   * @param _item Item of the loop
   */
  public trackByFn(index: any, _item: any) {
    return index;
  }

  /**
   * Return the status string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getStateString(status: TicketStatus): string {
    return ticketStatusText[status];
  }

  /**
   * Return the subtype string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getSubTypeString(status: TicketSubType) {
    return ticketSubTypeText[status];
  }

  /**
   * Download the file attachment based on the blob
   * @param attachment Attachment information of the file to download
   */
  public downloadAttachment(attachment: TicketAttachment) {
    if (isNullOrEmpty(attachment)) { return; }

    this._ticketsService.getFileAttachment(this.ticket.id, attachment.id)
      .subscribe((blobResponse) => {
        saveAs(blobResponse, attachment.fileName);
      });
  }

  /**
   * Create the whole comment including attachment
   * @param comment Comment information details
   */
  public createComment(comment: McsComment) {
    if (isNullOrEmpty(comment)) { return; }

    // Create comment
    this._createCommentContent(comment.message);

    // Create attachment
    if (!isNullOrEmpty(comment.attachments)) {
      comment.attachments.forEach((attachment) => {
        this._createAttachment(attachment);
      });
    }
  }

  private _createCommentContent(content: string) {
    if (isNullOrEmpty(content)) { return; }

    // Create comment
    let newComment = new TicketCreateComment();
    newComment.category = TicketCommentCategory.Task;
    newComment.type = TicketCommentType.Comments;
    newComment.value = content;

    this.createCommentSubscription = this._ticketsService
      .createComment(this.ticket.id, newComment)
      .subscribe((response) => {
        // Add the new comment in the activity list
        if (!isNullOrEmpty(response)) {
          let activity = new TicketActivity();
          activity.setBasedOnComment(response.content);
          this._addActivity(activity);
        }
      });
    this.createCommentSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  private _createAttachment(attachedFile: McsFileInfo) {
    if (isNullOrEmpty(attachedFile)) { return; }

    // Create attachment
    let newAttachment = new TicketCreateAttachment();

    newAttachment.fileName = attachedFile.filename;
    newAttachment.contents = attachedFile.base64Contents;

    this.createAttachmentSubscription = this._ticketsService
      .createAttachment(this.ticket.id, newAttachment)
      .subscribe((response) => {
        // Add the new attachment in the activity list and the attachments
        if (!isNullOrEmpty(response)) {
          let activity = new TicketActivity();
          activity.setBasedOnAttachment(response.content);
          this._addActivity(activity);
          this.ticket.attachments.splice(0, 0, response.content);
        }
      });
    this.createAttachmentSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Get Ticket based on the given ID in the provided parameter
   */
  private _getTicketById(): void {
    this.ticketSubscription = this._activatedRoute.paramMap
      .switchMap((params: ParamMap) => {
        let ticketId = params.get('id');
        return this._ticketsService.getTicket(ticketId);
      })
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.ticket = response.content;
        }
      });
  }

  /**
   * Add a new activity and sort it by dates accordingly
   * @param activity Activity to be added
   */
  private _addActivity(activity: TicketActivity) {
    if (isNullOrEmpty(activity)) { return; }

    this.activities.push(activity);
    // Sort activities by date
    this.activities.sort((_first: TicketActivity, _second: TicketActivity) => {
      return compareDates(_second.date, _first.date);
    });
  }

  /**
   * Set the activities of the ticket and sort it by created date
   * @param ticket Ticket to get the comments/attachment from
   */
  private _setActivities(ticket: Ticket): void {
    if (isNullOrEmpty(ticket)) { return; }
    let ticketActivities: TicketActivity[] = new Array();

    // Add attachment to the activity list
    this.ticket.attachments.forEach((ticketAttachment) => {
      let activity = new TicketActivity();

      activity.setBasedOnAttachment(ticketAttachment);
      ticketActivities.push(activity);
    });

    // Add comments to the activity list
    this.ticket.comments.forEach((ticketItem) => {
      let activity = new TicketActivity();

      activity.setBasedOnComment(ticketItem);
      ticketActivities.push(activity);
    });

    // Sort activities by date
    ticketActivities.sort((_first: TicketActivity, _second: TicketActivity) => {
      return compareDates(_second.date, _first.date);
    });
    this.activities = ticketActivities;
  }
}
