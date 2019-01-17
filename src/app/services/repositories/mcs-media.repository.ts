import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  takeUntil
} from 'rxjs/operators';
import {
  McsNotificationEventsService,
  McsRepositoryBase
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  McsEventHandler
} from '@app/utilities';
import {
  McsJob,
  DataStatus,
  McsResourceMedia,
  McsResourceMediaServer,
  McsResourceCatalogItemCreate,
  McsApiJobRequestBase,
  McsServerAttachMedia
} from '@app/models';
import { MediaApiService } from '../api-services/media-api.service';
import { McsMediaDataContext } from '../data-context/mcs-media-data.context';

@Injectable()
export class McsMediaRepository extends McsRepositoryBase<McsResourceMedia>
  implements McsEventHandler {

  constructor(
    private _mediaApiService: MediaApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(new McsMediaDataContext(_mediaApiService));
  }

  /**
   * This will obtain the servers attached to the media from API
   * and update the existing media in the repository
   * @param activeMedia Active media to set the Servers
   */
  public getMediaServers(activeMedia: McsResourceMedia): Observable<McsResourceMediaServer[]> {
    return this._mediaApiService.getMediaServers(activeMedia.id)
      .pipe(
        map((response) => {
          activeMedia.servers = this.updateRecordProperty(
            activeMedia.servers, response.content);
          this.addOrUpdate(activeMedia);
          return response.content;
        })
      );
  }

  /**
   * An observable method that sends a request to API for uploading media and returns a job
   * @param resourceId Resource ID where the media would be uploaded
   * @param uploadDetails Upload details of the media to be provided
   */
  public uploadMedia(
    resourceId: string,
    uploadDetails: McsResourceCatalogItemCreate
  ): Observable<McsJob> {
    return this._mediaApiService.uploadMedia(resourceId, uploadDetails).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Detaches the server to the existing media
   * @param serverId Server Identification to be detached from the media
   * @param mediaId Media Identification where the server will be detached
   * @param referenceObject Reference object to be returned from the job
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsJob> {
    return this._mediaApiService.detachServerMedia(serverId, mediaId, referenceObject).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Attaches the server to the existing media
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: any,
    mediaDetails: McsServerAttachMedia
  ): Observable<McsJob> {
    return this._mediaApiService.attachServerMedia(serverId, mediaDetails).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * A virtual method that gets called when all of the obtainment from api are finished
   */
  public registerEvents() {
    this._notificationEvents.createResourceCatalogItemEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onMediaUpload.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onSetServerMediaStatus.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .pipe(takeUntil(this.eventResetSubject))
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
   * Event that emits when uploading a media
   */
  private _onMediaUpload(job: McsJob): void {
    let successfullyEnded = job && job.dataStatus === DataStatus.Success;
    if (!successfullyEnded) { return; }
    this.clearCache();
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
