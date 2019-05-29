import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsResourceMedia,
  McsResourceMediaServer,
  McsJob,
  McsServerAttachMedia,
  McsServerDetachMedia
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
   * Detaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification to be detached from the media
   * @param mediaId Media Identification where the server will be detached
   * @param serverDetails Server details to be detached
   */
  detachServerMedia(
    serverId: any,
    mediaId: any,
    serverDetails: McsServerDetachMedia
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
