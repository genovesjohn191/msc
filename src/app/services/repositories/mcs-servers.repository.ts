import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';
import {
  McsServer,
  McsServerStorageDevice,
  McsServerNic,
  McsServerMedia,
  McsServerSnapshot,
  McsServerCompute,
  McsServerOsUpdates,
  McsServerRename,
  McsServerStorageDeviceUpdate,
  McsServerCreateNic,
  McsServerUpdate,
  McsServerAttachMedia,
  McsServerThumbnail,
  McsJob,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesScheduleRequest,
  McsServerCreate,
  McsServerClone,
  McsServerOsUpdatesCategory,
  McsServerOsUpdatesRequest,
  McsServerOsUpdatesDetails,
  McsServerPowerstateCommand,
  McsServerDetachMedia,
  McsServerSnapshotRestore,
  McsServerSnapshotDelete,
  McsServerSnapshotCreate
} from '@app/models';
import {
  McsApiClientFactory,
  McsApiServersFactory,
  IMcsApiServersService
} from '@app/api-client';
import { McsServersDataContext } from '../data-context/mcs-servers-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsServersRepository extends McsRepositoryBase<McsServer> {
  private readonly _serversApiService: IMcsApiServersService;

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsServersDataContext(
      _apiClientFactory.getService(new McsApiServersFactory())
    ));
    this._serversApiService = _apiClientFactory.getService(new McsApiServersFactory());
  }

  /**
   * This will obtain the server disks values from API
   * and update the storage device of the active server
   * @param activeServer Active server to set storage device
   */
  public getServerDisks(activeServer: McsServer): Observable<McsServerStorageDevice[]> {
    return this._serversApiService.getServerStorage(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.storageDevices = this.updateRecordProperty(
            activeServer.storageDevices, response.content);
          this.addOrUpdate(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the server nics values from API
   * and update the nics of the active server
   * @param activeServer Active server to set the NICs
   */
  public getServerNics(activeServer: McsServer): Observable<McsServerNic[]> {
    return this._serversApiService.getServerNics(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.nics = this.updateRecordProperty(
            activeServer.nics, response.content);
          this.addOrUpdate(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the server compute values from API
   * and update the compute of the active server
   * @param activeServer Active server to set the compute
   * @description TODO: Haven't implemented this because the update is not real time
   * waiting for the orch to implement this endpoint
   */
  public getServerCompute(activeServer: McsServer): Observable<McsServerCompute> {
    return this._serversApiService.getServerCompute(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.compute = this.updateRecordProperty(
            activeServer.compute, response.content);
          this.addOrUpdate(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the server medias values from API
   * and update the media of the active server
   * @param activeServer Active server to set the media
   */
  public getServerMedia(activeServer: McsServer): Observable<McsServerMedia[]> {
    return this._serversApiService.getServerMedias(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.media = this.updateRecordProperty(
            activeServer.media, response.content);
          this.addOrUpdate(activeServer);
          return response.content;
        })
      );
  }

  /**
   * Find all related snapshots from the server
   * @param serverId Server id where to get the snapshots
   */
  public getSnapshots(activeServer: McsServer): Observable<McsServerSnapshot[]> {
    return this._serversApiService.getServerSnapshots(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.snapshots = this.updateRecordProperty(
            activeServer.snapshots, response.content);
          this.addOrUpdate(activeServer);
          return response.content;
        })
      );
  }

  /**
   * Calls the api service to find all related updates from the server
   * @param serverId Server id where to get the updates
   */
  public getServerOsUpdates(activeServer: McsServer): Observable<McsServerOsUpdates[]> {
    return this._serversApiService.getServerOsUpdates(
      activeServer.id,
      { pageSize: 10000, keyword: '', pageIndex: 1 } // get all the os updates
    ).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to find the os updates details from the server
   * @param serverId Server id where to get the updates
   */
  public getServerOsUpdatesDetails(serverId: string): Observable<McsServerOsUpdatesDetails> {
    return this._serversApiService.getServerOsUpdatesDetails(serverId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to update server by ID
   * @param id Server identification
   * @param updates Can be update IDs or/and categories
   */
  public updateServerOs(
    activeServer: McsServer,
    updates: McsServerOsUpdatesRequest
  ): Observable<McsJob> {
    return this._serversApiService.updateServerOs(activeServer.id, updates).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to inspect the Server for available os-updates
   * @param id Server identification
   */
  public inspectServerForAvailableOsUpdates(id: string, referenceObject: any): Observable<McsJob> {
    return this._serversApiService.inspectServerForAvailableOsUpdates(id, referenceObject).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to get the schedule of the Server OS update
   * @param id Server identification
   */
  public getServerOsUpdatesSchedule(id: string): Observable<McsServerOsUpdatesSchedule[]> {
    return this._serversApiService.getServerOsUpdatesSchedule(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to update the schedule of the Server OS update
   * @param id Server identification
   * @param schedule Model that contains the cron and the schedule details
   */
  public updateServerOsUpdatesSchedule(
    id: string,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsServerOsUpdatesSchedule> {
    return this._serversApiService.updateServerOsUpdatesSchedule(
      id, schedule
    ).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to delete the schedule of the Server OS update
   * @param id Server identification
   */
  public deleteServerOsUpdatesSchedule(id: string): Observable<boolean> {
    return this._serversApiService.deleteServerOsUpdatesSchedule(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Calls the api service to get all the server os-updates categories
   */
  public getServerOsUpdatesCategories(): Observable<McsServerOsUpdatesCategory[]> {
    return this._serversApiService.getServerOsUpdatesCategories().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Resets a VM Password
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public resetVmPassword(id: string, referenceObject: any): Observable<McsJob> {
    return this._serversApiService.resetVmPassword(id, referenceObject).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: McsServerCreate): Observable<McsJob> {
    return this._serversApiService.createServer(serverData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * This will clone an existing server
   * @param id Server id to be cloned
   * @param serverData Server data to be cloned
   */
  public cloneServer(id: string, serverData: McsServerClone): Observable<McsJob> {
    return this._serversApiService.cloneServer(id, serverData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Deletes an existing server
   * @param id Server id to delete
   * @param referenceObject Reference object
   */
  public deleteServer(id: string, referenceObject: any): Observable<McsJob> {
    return this._serversApiService.deleteServer(id, referenceObject).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Renames a server based on the new name provided
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public renameServer(id: string, serverData: McsServerRename): Observable<McsJob> {
    return this._serversApiService.renameServer(id, serverData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Updates server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data to update
   */
  public updateServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApiService.updateServerStorage(serverId, storageId, storageData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Creates server storage based on the data provided
   * @param serverId Server identification
   * @param storageData Server storage data to create
   */
  public createServerStorage(
    serverId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApiService.createServerStorage(serverId, storageData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Adds server nic based on the nic data provided
   * @param serverId Server identification
   * @param nicData Server nic data
   */
  public addServerNic(
    serverId: string,
    nicData: McsServerCreateNic
  ): Observable<McsJob> {
    return this._serversApiService.addServerNic(serverId, nicData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Updates server compute data to process the scaling updates
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  public updateServerCompute(
    serverId: string,
    serverData: McsServerUpdate
  ): Observable<McsJob> {
    return this._serversApiService.updateServerCompute(serverId, serverData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Attaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: string,
    mediaData: McsServerAttachMedia
  ): Observable<McsJob> {
    return this._serversApiService.attachServerMedia(serverId, mediaData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Detaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaId Media Identification
   * @param mediaDetails Media details to be detached
   */
  public detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsJob> {
    return this._serversApiService.detachServerMedia(serverId, mediaId, mediaDetails).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Get the server thumbnail for the image of the console
   * @param serverId Server identification
   */
  public getServerThumbnail(serverId: string): Observable<McsServerThumbnail> {
    return this._serversApiService.getServerThumbnail(serverId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Creates server snapshot
   * @param serverId Server identification
   * @param data Snapshot model to be created
   */
  public createServerSnapshot(
    serverId: any,
    data: McsServerSnapshotCreate
  ): Observable<McsJob> {
    return this._serversApiService.createServerSnapshot(serverId, data).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Restores server snapshot
   * @param serverId Server identification
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public restoreServerSnapshot(
    serverId: any,
    snapshotRestore: McsServerSnapshotRestore
  ): Observable<McsJob> {
    return this._serversApiService.restoreServerSnapshot(serverId, snapshotRestore).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Deletes the existing server snapshot
   * @param serverId Server id to where the snapshot will be deleted
   * @param referenceObject Reference object
   */
  public deleteServerSnapshot(
    serverId: any,
    snapshotDelete: McsServerSnapshotDelete
  ): Observable<McsJob> {
    return this._serversApiService.deleteServerSnapshot(serverId, snapshotDelete).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
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
  ): Observable<McsJob> {
    return this._serversApiService.updateServerNic(serverId, nicId, nicData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
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
  ): Observable<McsJob> {
    return this._serversApiService.deleteServerNic(serverId, nicId, nicData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Deletes server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public deleteServerStorage(
    serverId: any,
    storageId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApiService.deleteServerStorage(serverId, storageId, storageData).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Gets the server disks from the storage
   * @param serverId Server id to where the devices will be obtained
   */
  public getServerStorage(serverId: string): Observable<McsServerStorageDevice[]> {
    return this._serversApiService.getServerStorage(serverId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Put server command/action to process the server
   * @param id Server identification
   * @param command Command type (Start, Stop, Restart)
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public sendServerPowerState(id: string, powerstate: McsServerPowerstateCommand): Observable<McsJob> {
    return this._serversApiService.sendServerPowerState(id, powerstate).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }
}
