import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  finalize,
  map
} from 'rxjs/operators';
import {
  McsApiService,
  McsLoggerService
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiJobRequestBase,
  McsJob,
  McsResourceMedia,
  McsResourceMediaServer,
  McsServerAttachMedia,
  McsResourceCatalogItemCreate,
  McsQueryParam
} from '@app/models';
import { ServersApiService } from './servers-api.service';
import { ResourcesApiService } from './resources-api.service';

/**
 * Media Service Class
 */
@Injectable()
export class MediaApiService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService,
    private _serversService: ServersApiService,
    private _resourcesService: ResourcesApiService
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMedia[]>(McsResourceMedia, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMedia>(McsResourceMedia, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceMediaServer[]>(McsResourceMediaServer, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * An observable method that sends a request to API for uploading media
   * @param resourceId Resource ID where the media would be uploaded
   * @param uploadDetails Upload details of the media to be provided
   */
  public uploadMedia(resourceId: string, uploadDetails: McsResourceCatalogItemCreate) {
    return this._resourcesService.createCatalogItem(resourceId, uploadDetails);
  }

  /**
   * Detaches the server to the existing media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification to be detached from the media
   * @param mediaId Media Identification where the server will be detached
   * @param referenceObject Reference object to be returned from the job
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsApiSuccessResponse<McsJob>> {
    return this._serversService.detachServerMedia(serverId, mediaId, referenceObject);
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
