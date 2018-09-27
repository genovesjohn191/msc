import {
  Injectable,
  EventEmitter
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsNotificationEventsService
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsJob,
  DataStatus,
  McsResourceMedia,
  McsResourceMediaServer
} from '@app/models';
import { MediaApiService } from '../api-services/media-api.service';

@Injectable()
export class MediaRepository extends McsRepositoryBase<McsResourceMedia> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

  constructor(
    private _mediaApiService: MediaApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
    this._registerJobEvents();
  }

  /**
   * This will obtain the servers attached to the media from API
   * and update the existing media in the repository
   * @param activeMedia Active media to set the Servers
   */
  public findMediaServers(activeMedia: McsResourceMedia): Observable<McsResourceMediaServer[]> {
    return this._mediaApiService.getMediaServers(activeMedia.id)
      .pipe(
        map((response) => {
          activeMedia.servers = this.updateRecordProperty(
            activeMedia.servers, response.content);
          this.updateRecord(activeMedia);
          return response.content;
        })
      );
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsResourceMedia[]>> {
    return this._mediaApiService.getMedia({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsResourceMedia>> {
    return this._mediaApiService.getMedium(recordId)
      .pipe(map((response) => response));
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.detachServerMediaEvent
      .subscribe(this._onSetServerMediaStatus.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .subscribe(this._onSetServerMediaStatus.bind(this));
  }

  /**
   * Event that emits when detaching a server to a media
   * @param job Emitted job content
   */
  private _onSetServerMediaStatus(job: McsJob): void {
    let activeMedia = this._getMediaByJob(job);
    if (isNullOrEmpty(activeMedia)) { return; }
    this._setMediaProcessDetails(activeMedia, job);
  }

  /**
   * Get the media based on job client reference object
   * @param job Emitted job content
   */
  private _getMediaByJob(job: McsJob): McsResourceMedia {
    if (isNullOrEmpty(job)) { return undefined; }
    return this.dataRecords.find((serverItem) => {
      return !isNullOrEmpty(job) && !isNullOrEmpty(job.clientReferenceObject)
        && serverItem.id === job.clientReferenceObject.mediaId;
    });
  }

  /**
   * Set the server process details to display in the view
   * @param job Emitted job content
   */
  private _setMediaProcessDetails(activeMedia: McsResourceMedia, job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    activeMedia.isProcessing = job.dataStatus === DataStatus.InProgress;
    activeMedia.processingText = job.summaryInformation;
  }
}
