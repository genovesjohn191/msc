import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  serializeObjectToJson,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsJob,
  McsServerCreate,
  McsServerRename,
  McsServerClone,
  McsServerUpdate,
  McsServer,
  McsServerThumbnail,
  McsServerOperatingSystem,
  McsServerStorageDevice,
  McsServerStorageDeviceUpdate,
  McsServerNic,
  McsServerCreateNic,
  McsServerSnapshot,
  McsServerSnapshotCreate,
  McsServerMedia,
  McsServerAttachMedia,
  McsServerCompute,
  McsServerOsUpdates,
  McsServerOsUpdatesRequest,
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesDetails,
  McsServerOsUpdatesCategory,
  McsServerPowerstateCommand,
  McsServerDetachMedia,
  McsServerSnapshotRestore,
  McsServerSnapshotDelete,
  McsServerPasswordReset,
  McsServerDelete,
  McsServerOsUpdatesInspectRequest,
  McsServerBackupVm,
  McsServerBackupServer,
  McsServerHostSecurityAvLog,
  McsServerHostSecurityHidsLog,
  McsServerHostSecurity
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiServersService } from '../interfaces/mcs-api-servers.interface';

/**
 * Servers Services Class
 */
@Injectable()
export class McsApiServersService implements IMcsApiServersService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Servers (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getServers(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServer[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServer[]>(McsServer, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get server by ID (MCS API Response)
   * @param id Server identification
   */
  public getServer(id: any): Observable<McsApiSuccessResponse<McsServer>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServer>(McsServer, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get the os-updates of the server
   * @param id Server identification
   * @param query contains the keyword, page index and size
   */
  public getServerOsUpdates(
    id: any,
    query?: McsQueryParam
  ): Observable<McsApiSuccessResponse<McsServerOsUpdates[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOsUpdates[]>(McsServerOsUpdates, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get the os-updates details of the server
   * @param id Server identification
   * @param query contains the keyword, page index and size
   */
  public getServerOsUpdatesDetails(
    id: any
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesDetails>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/details`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOsUpdatesDetails>(McsServerOsUpdatesDetails, response);
          return apiResponse;
        })
      );
  }

  /**
   * Update server os by ID
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param updateRequestDetails Can be update IDs or/and categories
   */
  public updateServerOs(
    id: any,
    updateRequestDetails: McsServerOsUpdatesRequest
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/apply-requests`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(updateRequestDetails);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets all the server os-updates categories
   */
  public getServerOsUpdatesCategories()
    : Observable<McsApiSuccessResponse<McsServerOsUpdatesCategory[]>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/os-updates/categories`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOsUpdatesCategory[]>(
              McsServerOsUpdatesCategory, response
            );
          return apiResponse;
        })
      );
  }

  /**
   * Inspect the Server for available updates
   * @param id Server identification
   */
  public inspectServerForAvailableOsUpdates(
    id: string,
    inspectRequest: McsServerOsUpdatesInspectRequest
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/analysis-requests`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(inspectRequest);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(
              McsJob, response
            );
          return apiResponse;
        })
      );
  }

  /**
   * Get the schedule of the Server OS update
   * @param id Server identification
   */
  public getServerOsUpdatesSchedule(
    id: any
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule[]>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/schedules`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOsUpdatesSchedule[]>(
              McsServerOsUpdatesSchedule, response
            );
          return apiResponse;
        })
      );
  }

  /**
   * Update the schedule of the Server OS update
   * @param id Server identification
   * @param schedule Model that contains the cron and the schedule details
   */
  public updateServerOsUpdatesSchedule(
    id: any,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/schedules`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(schedule);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOsUpdatesSchedule>(
              McsServerOsUpdatesSchedule, response
            );
          return apiResponse;
        })
      );
  }

  /**
   * Delete the schedule of the Server OS update
   * @param id Server identification
   */
  public deleteServerOsUpdatesSchedule(
    id: any
  ): Observable<McsApiSuccessResponse<boolean>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/os-updates/schedules`;

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<boolean>(Boolean, response);
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
  public sendServerPowerState(
    id: any,
    powerstate: McsServerPowerstateCommand
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/power`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(powerstate);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Post server reset vm password
   * @param id Server identification
   * @param resetDetails Server details to be reset
   */
  public resetVmPassword(id: any, resetDetails: McsServerPasswordReset):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/password/reset`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(resetDetails);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Renames a server based on the new name provided
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public renameServer(id: any, serverData: McsServerRename):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/name`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Updates server compute data to process the scaling updates
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  public updateServerCompute(
    id: any,
    serverData: McsServerUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/compute`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: McsServerCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
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
    serverData: McsServerClone
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/clone`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(serverData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will delete an existing server
   * @param id Server id to delete
   * @param deleteDetails Details of the server to be deleted
   */
  public deleteServer(id: string, deleteDetails: McsServerDelete): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(deleteDetails);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server os data from the API
   */
  public getServerOs(): Observable<McsApiSuccessResponse<McsServerOperatingSystem[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/os';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerOperatingSystem[]>(McsServerOperatingSystem, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server storage data from the API
   */
  public getServerStorage(serverId: any):
    Observable<McsApiSuccessResponse<McsServerStorageDevice[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerStorageDevice[]>(McsServerStorageDevice, response);
          return apiResponse;
        })
      );
  }

  /**
   * Creates server storage based on the data provided
   * @param serverId Server identification
   * @param storageData Server storage data
   */
  public createServerStorage(
    serverId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Updates server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Deletes server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public deleteServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(storageData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get the server thumbnail for the image of the console
   * * Note: This will return the thumbnail for display
   * @param id Server identification
   */
  public getServerThumbnail(id: any): Observable<McsApiSuccessResponse<McsServerThumbnail>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/thumbnail`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerThumbnail>(McsServerThumbnail, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server networks from the API
   */
  public getServerNics(serverId: any): Observable<McsApiSuccessResponse<McsServerNic[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerNic[]>(McsServerNic, response);
          return apiResponse;
        })
      );
  }

  /**
   * Adds server nic based on the nic data provided
   * @param serverId Server identification
   * @param nicData Server nic data
   */
  public addServerNic(
    serverId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Updates server nic based on the ID provided
   * @param serverId Server identification
   * @param nicId NIC identification
   * @param nicData Server network data
   */
  public updateServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics/${nicId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Deletes server nic based on the ID provided
   * @param serverId Server identification
   * @param nicId Network identification
   * @param nicData Server network data
   */
  public deleteServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/nics/${nicId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(nicData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server compute from the API
   */
  public getServerCompute(serverId: any): Observable<McsApiSuccessResponse<McsServerCompute>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/compute`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerCompute>(McsServerCompute, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will get the server medias from the API
   */
  public getServerMedias(serverId: any): Observable<McsApiSuccessResponse<McsServerMedia[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerMedia[]>(McsServerMedia, response);
          return apiResponse;
        })
      );
  }

  /**
   * Attaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: any,
    mediaDetails: McsServerAttachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(mediaDetails);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Detaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaId Media Identification
   * @param referenceObject Reference object to be returned from the job
   */
  public detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media/${mediaId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(mediaDetails);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get server snapshots from API
   * @param id Server identification
   */
  public getServerSnapshots(serverId: any): Observable<McsApiSuccessResponse<McsServerSnapshot[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/snapshots`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerSnapshot[]>(McsServerSnapshot, response);
          return apiResponse;
        })
      );
  }

  /**
   * Creates server snapshot
   * @param serverId Server identification
   * @param data Snapshot model to be created
   */
  public createServerSnapshot(id: any, createSnapshot: McsServerSnapshotCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(createSnapshot);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Restores server snapshot
   * @param serverId Server identification
   * @param snapshotRestore Restore details of the snapshot
   */
  public restoreServerSnapshot(id: any, snapshotRestore: McsServerSnapshotRestore):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots/restore`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(snapshotRestore);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Deletes the existing server snapshot
   * @param serverId Server id to where the snapshot will be deleted
   * @param snapshotDelete Delete details of the snapshot
   */
  public deleteServerSnapshot(id: string, snapshotDelete: McsServerSnapshotDelete):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/snapshots`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(snapshotDelete);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the summary of a server's vm backup
   * @param serverId Server id to where the vm backup will be coming from
   */
  public getServerBackupVm(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupVm>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/vm-backup`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupVm>(McsServerBackupVm, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the summary of a server's server backup
   * @param serverId Server id to where the vm backup will be coming from
   */
  public getServerBackupServer(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupServer>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/server-backup`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupServer>(McsServerBackupServer, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the server host security details
   * @param serverId Server id to where the host security will be coming from
   */
  public getServerHostSecurity(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurity>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/host-security`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurity>(McsServerHostSecurity, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the server av logs
   * @param serverId Server id to where the anti virus will be coming from
   */
  public getServerHostSecurityAvLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityAvLog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/hostsecurity/av/logs`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityAvLog>(McsServerHostSecurityAvLog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the server hids logs
   * @param serverId Server id to where the hids will be coming from
   */
  public getServerHostSecurityHidsLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityHidsLog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/hostsecurity/hids/logs`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityHidsLog>(McsServerHostSecurityHidsLog, response);
          return apiResponse;
        })
      );
  }
}
