import { saveAs } from 'file-saver';
import {
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  ticketTypeText,
  CommentCategory,
  CommentType,
  McsComment,
  McsFileInfo,
  McsTicket,
  McsTicketAttachment,
  McsTicketCreateAttachment,
  McsTicketCreateComment,
  TicketType,
  McsFeatureFlag,
  McsAzureResourcesInfo,
  McsAzureResource,
  McsIdentity
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  createObject
} from '@app/utilities';
import { McsAccessControlService, McsAuthenticationIdentity, McsCookieService } from '@app/core';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketComponent implements OnInit, OnDestroy {

  public selectedTicket$: Observable<McsTicket>;
  public isAzureResourcesLoading: boolean;
  public ticketAzureResources: McsAzureResourcesInfo[];

  private _downloadingIdList: Set<string>;
  private _ticketDetailsChange = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _ticketsDataChangeHandler: Subscription;

  public constructor(
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _changeDetectorRef: ChangeDetectorRef,
    private _cookieService: McsCookieService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
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
    return CommonDefinition.ASSETS_SVG_CHECK;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get resourceNotFoundText(): string {
    return this._translateService.instant('ticket.resourceNotFound');
  }

  public get activeCompanyId(): string {
    let companyIdHeader: string = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
    return companyIdHeader ? companyIdHeader : this._authenticationIdentity.user?.companyId;
  }

  /**
   * Whether to show attribution text or not in requestor
   */
  public ticketCreatedByDifferentCompanyId(createdByCompanyId: string, requestor: string): boolean {
    let ticketCreatedBySameCompanyId = this.activeCompanyId === createdByCompanyId;
    let invalidToShowAttributionText = ticketCreatedBySameCompanyId || isNullOrEmpty(requestor);
    if (invalidToShowAttributionText) { return false; }
    return true;
  }

  /**
   * Returns the formatted ticket header by ticket type and crisp ticket number
   */
  public getTicketHeader(ticket: McsTicket): string {
    if (isNullOrEmpty(ticket)) { return ''; }
    return `${ticket.typeLabel} #${ticket.ticketNumber}`;
  }

  /**
   * Return the ticket type string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getTicketTypeString(status: TicketType) {
    return ticketTypeText[status];
  }

  /**
   * Returns true when the attachment is currently downloading
   * @param attachmentId Attachment Id to be checked
   */
  public isDownloading(attachmentId: string): boolean {
    return this._downloadingIdList.has(attachmentId);
  }

  public showAzureSlg(azureSlg: string): boolean {
    let hasAzureSlgFeatureEnabled = this._accessControlService.hasAccessToFeature(McsFeatureFlag.AzureSlgTicket);
    let hasAzureSlgValue = !isNullOrEmpty(azureSlg);
    let showAzureSlgLabel =  hasAzureSlgFeatureEnabled && hasAzureSlgValue;
    return showAzureSlgLabel;
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
      map((resolver) => {
        let ticketDetails = getSafeProperty(resolver, (obj) => obj.ticket);
        this._getAzureResources(ticketDetails.azureResources)
        return ticketDetails;
      }),
      shareReplay(1)
    );
  }

  private _getAzureResources(ticketResources: string[]): void {
    if (ticketResources.length === 0)  { return; }
    this.isAzureResourcesLoading = true;
    this._apiService.getAzureResources().pipe(
      catchError((error) => {
        this.isAzureResourcesLoading = false;
        this.ticketAzureResources = this._createAzureResourcesObject(ticketResources);
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      takeUntil(this._destroySubject),
      shareReplay(1)
    ).subscribe((resourcesCollection) => {
      this.isAzureResourcesLoading = false;
      let resources = getSafeProperty(resourcesCollection, (obj) => obj.collection) || [];
      this.ticketAzureResources = this._createAzureResourcesObject(ticketResources, resources);
      this._changeDetectorRef.markForCheck();
    });
  }

  private _createAzureResourcesObject(ticketResources: string[], resources?: McsAzureResource[]): McsAzureResourcesInfo[] {
    let azureResources: McsAzureResourcesInfo[] = [];
    ticketResources.forEach((ticketResource) => {
      if (!isNullOrEmpty(resources)) {
        let resourceFound = resources.find((resource) => resource.azureId === ticketResource);
        azureResources.push(createObject(McsAzureResourcesInfo, {
          name: resourceFound ? resourceFound.name : ticketResource,
          resourceGroup: resourceFound ? `Resource Group: ${resourceFound.resourceGroupName}` : this.resourceNotFoundText
        }));
      } else {
        azureResources.push(createObject(McsAzureResourcesInfo, {
          name: ticketResource, // azure ID
          resourceGroup: this.resourceNotFoundText
        }));
      }
    })
    return azureResources;
  }

  /**
   * Registers the associated events
   */
  private _registerEvents(): void {
    this._ticketsDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeTickets, () => this._changeDetectorRef.markForCheck());
  }
}
