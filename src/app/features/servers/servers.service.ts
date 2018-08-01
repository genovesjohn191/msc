import { Injectable } from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  finalize,
  map,
  catchError
} from 'rxjs/operators';
import { Router } from '@angular/router';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiJob,
  McsAuthenticationIdentity,
  McsLoggerService,
  McsApiJobRequestBase,
  CoreRoutes,
  McsRouteKey
} from '../../core/';
import {
  serializeObjectToJson,
  isNullOrEmpty,
  getEnumString
} from '../../utilities';
import {
  Server,
  ServerClientObject,
  ServerThumbnail,
  ServerCreate,
  ServerRename,
  ServerClone,
  ServerUpdate,
  ServerCommand,
  ServerOperatingSystem,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerNic,
  ServerCreateNic,
  ServerSnapshot,
  ServerCreateSnapshot,
  ServerMedia,
  ServerAttachMedia
} from './models';

/**
 * Servers Services Class
 */
@Injectable()
export class ServersService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService,
    private _authIdentity: McsAuthenticationIdentity,
    private _router: Router
  ) { }

  /**
   * Get Servers (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param serverName Server name filter
   */
  public getServers(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }): Observable<McsApiSuccessResponse<Server[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<Server[]>(Server, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get server by ID (MCS API Response)
   * @param id Server identification
   */
  public getServer(id: any): Observable<McsApiSuccessResponse<Server>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<Server>(Server, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Put server command/action to process the server
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param command Command type (Start, Stop, Restart)
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public putServerCommand(
    id: any,
    action: ServerCommand,
    referenceObject: ServerClientObject
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/power`;
    mcsApiRequestParameter.recordData = serializeObjectToJson({
      command: getEnumString(ServerCommand, action),
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Post server reset vm password
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public resetVmPassword(id: any, referenceObject: ServerClientObject):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/password/reset`;
    mcsApiRequestParameter.recordData = serializeObjectToJson({
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Put server rename
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public renameServer(id: any, serverData: ServerRename):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/name`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Patch server data to process the scaling updates
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  public updateServerCompute(
    id: any,
    serverData: ServerUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/compute`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: ServerCreate):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will clone an existing server
   * @param id Server id to be cloned
   * @param serverData Server data to be cloned
   */
  public cloneServer(
    id: string,
    serverData: ServerClone
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/clone`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will delete an existing server
   * @param id Server id to delete
   * @param referenceObject Reference object
   */
  public deleteServer(
    id: string,
    referenceObject: ServerClientObject
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson({
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server os data from the API
   */
  public getServerOs(): Observable<McsApiSuccessResponse<ServerOperatingSystem[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/os';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerOperatingSystem[]>(ServerOperatingSystem, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server storage data from the API
   */
  public getServerStorage(serverId: any): Observable<McsApiSuccessResponse<ServerStorageDevice[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerStorageDevice[]>(ServerStorageDevice, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Creating server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageData Server storage data
   */
  public createServerStorage(
    serverId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Updating server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Deleting server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public deleteServerStorage(
    serverId: any,
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get the server thumbnail for the image of the console
   * * Note: This will return the thumbnail for display
   * @param id Server identification
   */
  public getServerThumbnail(id: any): Observable<McsApiSuccessResponse<ServerThumbnail>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/thumbnail`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerThumbnail>(ServerThumbnail, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server networks from the API
   */
  public getServerNics(
    serverId: any): Observable<McsApiSuccessResponse<ServerNic[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerNic[]>(ServerNic, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Adding server nic
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param nicData Server nic data
   */
  public addServerNic(
    serverId: any,
    nicData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Updating server nic
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param nicId NIC identification
   * @param nicData Server network data
   */
  public updateServerNic(
    serverId: any,
    nicId: any,
    nicData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics/${nicId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Deleting server nic
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param nicId Network identification
   * @param nicData Server network data
   */
  public deleteServerNic(
    serverId: any,
    nicId: any,
    nicData: ServerCreateNic
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics/${nicId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server medias from the API
   */
  public getServerMedias(serverId: any): Observable<McsApiSuccessResponse<ServerMedia[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerMedia[]>(ServerMedia, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Attaching server media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: any,
    mediaDetails: ServerAttachMedia
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(mediaDetails);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Detaching server media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaId Media Identification
   * @param referenceObject Reference object to be returned from the job
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media/${mediaId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(referenceObject);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get server snapshots from API
   * @param id Server identification
   */
  public getServerSnapshots(serverId: any): Observable<McsApiSuccessResponse<ServerSnapshot[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/snapshots`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<ServerSnapshot[]>(ServerSnapshot, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Create the server snapshot
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param createSnapshot Snapshot model to be created
   */
  public createServerSnapshot(id: any, createSnapshot: ServerCreateSnapshot):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(createSnapshot);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Restore the server snapshot
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public restoreServerSnapshot(id: any, referenceObject?: McsApiJobRequestBase):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots/restore`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(referenceObject);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * This will delete the existing server snapshot
   * @param id Server id to where the snapshot will be deleted
   * @param referenceObject Reference object
   */
  public deleteServerSnapshot(id: string, referenceObject?: McsApiJobRequestBase):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(referenceObject);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiJob>(McsApiJob, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Execute the server command according to inputs
   * @param data Data of the server to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(
    data: { server: Server, result?: any },
    action: ServerCommand
  ) {

    switch (action) {
      case ServerCommand.ViewVCloud:
        window.open(data.server.portalUrl);
        break;

      case ServerCommand.Scale:
        this._router.navigate([
          CoreRoutes.getPath(McsRouteKey.Servers),
          data.server.id,
          CoreRoutes.getPath(McsRouteKey.ServerDetailManagement)
        ], { queryParams: { scale: true } }
        );
        break;

      case ServerCommand.Clone:
        this._router.navigate(
          [CoreRoutes.getPath(McsRouteKey.ServerCreate)],
          { queryParams: { clone: data.server.id } }
        );
        break;

      case ServerCommand.ResetVmPassword:
        this.setServerSpinner(data.server);
        this.resetVmPassword(data.server.id,
          {
            serverId: data.server.id,
            userId: this._authIdentity.user.userId,
            commandAction: action,
            powerState: data.server.powerState,
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          )
          .subscribe(() => {
            // Subscribe to execute the reset vm password
          });
        break;

      case ServerCommand.Delete:
        this.setServerSpinner(data.server);
        this.deleteServer(data.server.id,
          {
            serverId: data.server.id,
            commandAction: action,
            powerState: data.server.powerState
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          ).subscribe();
        this._router.navigate([CoreRoutes.getPath(McsRouteKey.Servers)]);
        break;

      case ServerCommand.Rename:
        this.setServerSpinner(data.server);
        this.renameServer(data.server.id,
          {
            name: data.result,    // Server name
            clientReferenceObject: {
              serverId: data.server.id,
              commandAction: action,
              powerState: data.server.powerState,
              newName: data.result
            }
          })
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          ).subscribe();
        break;

      default:
        this.setServerSpinner(data.server);
        this.putServerCommand(data.server.id, action,
          {
            serverId: data.server.id,
            powerState: data.server.powerState,
            commandAction: action
          } as ServerClientObject)
          .pipe(
            catchError((error) => {
              this.clearServerSpinner(data.server);
              return throwError(error);
            })
          ).subscribe();
        break;
    }
  }

  /**
   * Set the server status to inprogress to display the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public setServerSpinner(server: Server, ...classes: any[]): void {
    this._setServerExecutionStatus(server, true, ...classes);
  }

  /**
   * Clear the server status to hide the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public clearServerSpinner(server: Server, ...classes: any[]): void {
    this._setServerExecutionStatus(server, false, ...classes);
  }

  /**
   * Set the server execution based on status in order for the
   * server to load first while waiting for the corresponding job
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  private _setServerExecutionStatus(
    server: Server,
    status: boolean = true,
    ...classes: any[]
  ): void {
    if (isNullOrEmpty(server)) { return; }
    server.isProcessing = status;
    server.processingText = 'Processing request.';

    // Additional instance to set the process flag
    if (!isNullOrEmpty(classes)) {
      classes.forEach((param) => {
        if (isNullOrEmpty(param)) {
          param = Object.create(param);
          param.isProcessing = status;
        } else {
          param.isProcessing = status;
        }
      });
    }
  }
}
