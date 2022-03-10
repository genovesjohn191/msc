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

  public getMedia(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsResourceMedia[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/resources/media';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

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

  public getMedium(id: any): Observable<McsApiSuccessResponse<McsResourceMedia>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/media/${id}`;

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

  public getMediaServers(mediaId: any):
    Observable<McsApiSuccessResponse<McsResourceMediaServer[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/media/${mediaId}/servers`;

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

  public detachServerMedia(
    serverId: any,
    mediaId: any,
    serverDetails: McsServerDetachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    return this._serversService.detachServerMedia(serverId, mediaId, serverDetails);
  }

  public attachServerMedia(
    serverId: any,
    mediaDetails: McsServerAttachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    return this._serversService.attachServerMedia(serverId, mediaDetails);
  }
}
