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
  McsServerHostSecurity,
  McsServerHostSecurityAntiVirus,
  McsServerHostSecurityHids,
  McsServerBackupVmDetails,
  McsServerBackupServerDetails,
  McsServersQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiServersService } from '../interfaces/mcs-api-servers.interface';
import { McsApiClientDefinition } from '../mcs-api-client.definition';

/**
 * Servers Services Class
 */
@Injectable()
export class McsApiServersService implements IMcsApiServersService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getServers(query?: McsServersQueryParams, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsServer[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('storage_profile', query.storageProfile);
    searchParams.set('expand', query.expand);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/servers';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

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

  public getServer(id: any): Observable<McsApiSuccessResponse<McsServer>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}`;

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
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates`;
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

  public getServerOsUpdatesDetails(
    id: any
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesDetails>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/details`;

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

  public updateServerOs(
    id: any,
    updateRequestDetails: McsServerOsUpdatesRequest
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/apply-requests`;
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

  public getServerOsUpdatesCategories()
    : Observable<McsApiSuccessResponse<McsServerOsUpdatesCategory[]>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/os-updates/categories`;

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

  public inspectServerForAvailableOsUpdates(
    id: string,
    inspectRequest: McsServerOsUpdatesInspectRequest
  ): Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/analysis-requests`;
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

  public getServerOsUpdatesSchedule(
    id: any
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule[]>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/schedules`;

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

  public updateServerOsUpdatesSchedule(
    id: any,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/schedules`;
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

  public deleteServerOsUpdatesSchedule(
    id: any
  ): Observable<McsApiSuccessResponse<boolean>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/os-updates/schedules`;

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

  public sendServerPowerState(
    id: any,
    powerstate: McsServerPowerstateCommand
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/power`;
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

  public resetVmPassword(id: any, resetDetails: McsServerPasswordReset):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/password/reset`;
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

  public renameServer(id: any, serverData: McsServerRename):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/name`;
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

  public updateServerCompute(
    id: any,
    serverData: McsServerUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/compute`;
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

  public createServer(serverData: McsServerCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/servers';
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

  public cloneServer(
    id: string,
    serverData: McsServerClone
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/clone`;
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

  public deleteServer(id: string, deleteDetails: McsServerDelete): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}`;
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

  public getServerOs(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsServerOperatingSystem[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/servers/os';
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

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

  public getServerStorage(serverId: any):
    Observable<McsApiSuccessResponse<McsServerStorageDevice[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/disks`;

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

  public createServerStorage(
    serverId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/disks`;
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

  public updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/disks/${storageId}`;
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

  public deleteServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/disks/${storageId}`;
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

  public getServerThumbnail(id: any): Observable<McsApiSuccessResponse<McsServerThumbnail>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/thumbnail`;

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

  public getServerNics(serverId: any): Observable<McsApiSuccessResponse<McsServerNic[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/nics`;

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

  public addServerNic(
    serverId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/nics`;
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

  public updateServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/nics/${nicId}`;
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

  public deleteServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/nics/${nicId}`;
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

  public getServerCompute(serverId: any): Observable<McsApiSuccessResponse<McsServerCompute>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/compute`;

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

  public getServerMedias(serverId: any): Observable<McsApiSuccessResponse<McsServerMedia[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/media`;

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

  public attachServerMedia(
    serverId: any,
    mediaDetails: McsServerAttachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/media`;
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

  public detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/media/${mediaId}`;
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

  public getServerSnapshots(serverId: any): Observable<McsApiSuccessResponse<McsServerSnapshot[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${serverId}/snapshots`;

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

  public createServerSnapshot(id: any, createSnapshot: McsServerSnapshotCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/snapshots`;
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

  public restoreServerSnapshot(id: any, snapshotRestore: McsServerSnapshotRestore):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/snapshots/restore`;
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

  public deleteServerSnapshot(id: string, snapshotDelete: McsServerSnapshotDelete):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/snapshots`;
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

  public getServerBackupVm(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupVm>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/vm-backup`;

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

  public getServerBackupVmDetails(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupVmDetails>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/vm-backup/details`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupVmDetails>(McsServerBackupVmDetails, response);
          return apiResponse;
        })
      );
  }

  public getServerBackupVms(): Observable<McsApiSuccessResponse<McsServerBackupVm[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/vm-backups`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupVm[]>(McsServerBackupVm, response);
          return apiResponse;
        })
      );
  }

  public getServerBackupServer(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupServer>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/server-backup`;

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

  public getServerBackupServerDetails(id: string):
    Observable<McsApiSuccessResponse<McsServerBackupServerDetails>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/server-backup/details`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupServerDetails>(McsServerBackupServerDetails, response);
          return apiResponse;
        })
      );
  }

  public getServerBackupServers():
    Observable<McsApiSuccessResponse<McsServerBackupServer[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/server-backups`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerBackupServer[]>(McsServerBackupServer, response);
          return apiResponse;
        })
      );
  }

  public getServerHostSecurity(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurity>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/host-security`;

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

  public getServerHostSecurityAntiVirus(): Observable<McsApiSuccessResponse<McsServerHostSecurityAntiVirus[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/host-security/av`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityAntiVirus[]>(McsServerHostSecurityAntiVirus, response);
          return apiResponse;
        })
      );
  }

  public getServerHostSecurityAvLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityAvLog[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/host-security/av/logs`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityAvLog[]>(McsServerHostSecurityAvLog, response);
          return apiResponse;
        })
      );
  }

  public getServerHostSecurityHids(): Observable<McsApiSuccessResponse<McsServerHostSecurityHids[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/host-security/hids`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityHids[]>(McsServerHostSecurityHids, response);
          return apiResponse;
        })
      );
  }

  public getServerHostSecurityHidsLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityHidsLog[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/servers/${id}/host-security/hids/logs`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsServerHostSecurityHidsLog[]>(McsServerHostSecurityHidsLog, response);
          return apiResponse;
        })
      );
  }
}
