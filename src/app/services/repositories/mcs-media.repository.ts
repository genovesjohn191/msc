import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import { getSafeProperty } from '@app/utilities';
import {
  McsJob,
  McsResourceMedia,
  McsResourceMediaServer,
  McsApiJobRequestBase,
  McsServerAttachMedia
} from '@app/models';
import {
  McsApiClientFactory,
  McsApiMediaFactory,
  IMcsApiMediaService
} from '@app/api-client';
import { McsMediaDataContext } from '../data-context/mcs-media-data.context';

@Injectable()
export class McsMediaRepository extends McsRepositoryBase<McsResourceMedia> {
  private readonly _mediaApiService: IMcsApiMediaService;

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsMediaDataContext(
      _apiClientFactory.getService(new McsApiMediaFactory())
    ));
    this._mediaApiService = _apiClientFactory.getService(new McsApiMediaFactory());
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
}
