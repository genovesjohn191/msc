import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsResourceMedia,
  McsResourceMediaServer,
  McsResourceCatalogItemCreate,
  McsJob,
  McsApiJobRequestBase,
  McsServerAttachMedia
} from '@app/models';

export interface IMcsApiMediaService {

  /**
   * Get Medias (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getMedia(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsResourceMedia[]>>;

  /**
   * Get media by ID (MCS API Response)
   * @param id Media identification
   */
  getMedium(id: any): Observable<McsApiSuccessResponse<McsResourceMedia>>;

  /**
   * Get the attached servers from the media
   */
  getMediaServers(mediaId: any): Observable<McsApiSuccessResponse<McsResourceMediaServer[]>>;

  /**
   * An observable method that sends a request to API for uploading media
   * @param resourceId Resource ID where the media would be uploaded
   * @param uploadDetails Upload details of the media to be provided
   */
  uploadMedia(resourceId: string, uploadDetails: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Detaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification to be detached from the media
   * @param mediaId Media Identification where the server will be detached
   * @param referenceObject Reference object to be returned from the job
   */
  detachServerMedia(
    serverId: any,
    mediaId: any,
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Attaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  attachServerMedia(serverId: any, mediaDetails: McsServerAttachMedia): Observable<McsApiSuccessResponse<McsJob>>;
}
