import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsJob,
  McsResourceMedia,
  McsResourceMediaServer,
  McsServerAttachMedia,
  McsQueryParam,
  McsServerDetachMedia
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiMediaService } from '../interfaces/mcs-api-media.interface';
import { McsApiServersService } from './mcs-api-servers.service';

@Injectable()
export class McsApiMediaService implements IMcsApiMediaService {

  constructor(
    private _mcsApiService: McsApiClientHttpService,
    private _serversService: McsApiServersService
  ) { }

  /**
   * Get Medias (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getMedia(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsResourceMedia[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/resources/media';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMedia[]>(McsResourceMedia, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get media by ID (MCS API Response)
   * @param id Media identification
   */
  public getMedium(id: any): Observable<McsApiSuccessResponse<McsResourceMedia>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/media/${id}`;

    mcsApiRequestParameter.responseType = 'json';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMedia>(McsResourceMedia, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get the attached servers from the media
   */
  public getMediaServers(mediaId: any):
    Observable<McsApiSuccessResponse<McsResourceMediaServer[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/media/${mediaId}/servers`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMediaServer[]>(McsResourceMediaServer, response);
          return apiResponse;
        })
      );
  }

  /**
   * Detaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification to be detached from the media
   * @param mediaId Media Identification where the server will be detached
   * @param serverDetails Server details to be detached
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    serverDetails: McsServerDetachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    return this._serversService.detachServerMedia(serverId, mediaId, serverDetails);
  }

  /**
   * Attaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: any,
    mediaDetails: McsServerAttachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    return this._serversService.attachServerMedia(serverId, mediaDetails);
  }
}
