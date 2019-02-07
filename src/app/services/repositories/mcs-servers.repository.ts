import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  takeUntil
} from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsNotificationEventsService
} from '@app/core';
import {
  isNullOrEmpty,
  McsEventHandler,
  getSafeProperty
} from '@app/utilities';
import {
  McsServer,
  McsServerStorageDevice,
  McsServerNic,
  McsServerCompute,
  McsServerMedia,
  McsServerSnapshot,
  McsJob,
  DataStatus,
  ServerCommand,
  VmPowerState,
  McsServerCreate,
  McsServerClone,
  McsServerRename,
  McsServerStorageDeviceUpdate,
  McsServerCreateNic,
  McsServerUpdate,
  McsServerAttachMedia,
  McsApiJobRequestBase,
  McsServerThumbnail,
  McsServerCreateSnapshot
} from '@app/models';
import { ServersApiService } from '../api-services/servers-api.service';
import { McsServersDataContext } from '../data-context/mcs-servers-data.context';

@Injectable()
export class McsServersRepository extends McsRepositoryBase<McsServer>
  implements McsEventHandler {

  constructor(
    private _serversApiService: ServersApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(new McsServersDataContext(_serversApiService));
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
   * @param referenceObject Reference object to be returned from the job
   */
  public detachServerMedia(
    serverId: string,
    mediaId: string,
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsJob> {
    return this._serversApiService.detachServerMedia(serverId, mediaId, referenceObject).pipe(
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
    data: McsServerCreateSnapshot
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
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsJob> {
    return this._serversApiService.restoreServerSnapshot(serverId, referenceObject).pipe(
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
    referenceObject?: McsApiJobRequestBase
  ): Observable<McsJob> {
    return this._serversApiService.deleteServerSnapshot(serverId, referenceObject).pipe(
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
  public putServerCommand(
    id: string,
    action: ServerCommand,
    referenceObject: any
  ): Observable<McsJob> {
    return this._serversApiService.putServerCommand(id, action, referenceObject).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * A virtual method that gets called when all of the obtainment from api are finished
   */
  public registerEvents(): void {
    // TODO: Once we use the event-bus in here,
    // we need to create an event manager for the repository
    this._notificationEvents.createServerEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onCreateServer.bind(this));

    this._notificationEvents.cloneServerEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onCloneServer.bind(this));

    this._notificationEvents.renameServerEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onRenameServer.bind(this));

    this._notificationEvents.deleteServerEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onDeleteServer.bind(this));

    this._notificationEvents.changeServerPowerStateEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onPowerStateServer.bind(this));

    this._notificationEvents.updateServerComputeEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._onScaleServer.bind(this));

    this._notificationEvents.resetServerPasswordEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerDisk
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerDisk
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerDisk
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerNic
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerNic
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerNic
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerSnapshot
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.applyServerSnapshot
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerSnapshot
      .pipe(takeUntil(this.eventResetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));
  }

  /**
   * Event that emits when new server created
   * @param job Emitted job content
   */
  private _onCreateServer(job: McsJob): void {
    let successfullyCreated = !isNullOrEmpty(job) && job.dataStatus === DataStatus.Success;
    if (!successfullyCreated) { return; }
    this.clearCache();
  }

  /**
   * Event that emits when cloning a server
   * @param job Emitted job content
   */
  private _onCloneServer(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }

    let clonedServer = this._getServerByJob(job);
    if (!isNullOrEmpty(clonedServer)) {
      this._setServerProcessDetails(clonedServer, job);
    }

    if (job.dataStatus === DataStatus.Success) {
      this.clearCache();
    }
  }

  /**
   * Event that emits when the server deleted
   * @param job Emitted job content
   */
  private _onDeleteServer(job: McsJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._updateServerStatusByJob(job);
    if (job.dataStatus === DataStatus.Success) {
      this.clearCache();
    }
  }

  /**
   * Event that emits when server is renamed
   * @param job Emitted job content
   */
  private _onRenameServer(job: McsJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === DataStatus.Success) {
      activeServer.name = job.clientReferenceObject.newName;
    }
    this._updateServerStatusByJob(job);
  }

  /**
   * Event that emits when the server command is executed
   * @param job Emitted job content
   */
  private _onPowerStateServer(job: McsJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === DataStatus.Success) {
      this._updateServerPowerState(activeServer);
    }
    this._updateServerStatusByJob(job);
  }

  /**
   * Event that emits when scaling a server
   * @param job Emitted job content
   */
  private _onScaleServer(job: McsJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === DataStatus.Success && !isNullOrEmpty(activeServer.compute)) {
      activeServer.compute.memoryMB = job.clientReferenceObject.memoryMB;
      activeServer.compute.cpuCount = job.clientReferenceObject.cpuCount;
      activeServer.compute.coreCount = 1;
    }
    this._updateServerStatusByJob(job);
  }

  /**
   * Set the server process details to display in the view
   * @param job Emitted job content
   */
  private _setServerProcessDetails(activeServer: McsServer, job: McsJob): void {
    let noActiveServer = isNullOrEmpty(activeServer) || isNullOrEmpty(job);
    if (noActiveServer) { return; }
    activeServer.isProcessing = this._getProcessingFlagByJob(job);
    activeServer.commandAction = job.clientReferenceObject.commandAction;
    activeServer.processingText = job.summaryInformation;
  }

  /**
   * Updates the server status based on the job
   */
  private _updateServerStatusByJob(job: McsJob): void {
    let activeServer = this._getServerByJob(job);
    this._setServerProcessDetails(activeServer, job);
    this.addOrUpdate(activeServer);
  }

  /**
   * This will update the server power state
   * based on the command action
   * @param activeServer Active server
   */
  private _updateServerPowerState(activeServer: McsServer): void {
    if (isNullOrEmpty(activeServer)) { return; }

    switch (activeServer.commandAction) {
      case ServerCommand.Start:
      case ServerCommand.Restart:
      case ServerCommand.Resume:
        activeServer.powerState = VmPowerState.PoweredOn;
        break;

      case ServerCommand.Stop:
        activeServer.powerState = VmPowerState.PoweredOff;
        break;

      case ServerCommand.Suspend:
        activeServer.powerState = VmPowerState.Suspended;
        break;

      default:
        // Do nothing
        break;
    }
  }

  /**
   * Get the server based on job client reference object
   * @param job Emitted job content
   */
  private _getServerByJob(job: McsJob): McsServer {
    if (isNullOrEmpty(job)) { return undefined; }
    return this.dataRecords.find((serverItem) => {
      return !isNullOrEmpty(job) && !isNullOrEmpty(job.clientReferenceObject)
        && serverItem.id === job.clientReferenceObject.serverId;
    });
  }

  /**
   * Returns the processing flag based on job status
   */
  private _getProcessingFlagByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job)) { return false; }
    return job.dataStatus === DataStatus.InProgress;
  }
}
