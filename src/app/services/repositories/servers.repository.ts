import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  map,
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsNotificationEventsService
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsJob,
  DataStatus,
  McsServer,
  ServerCommand,
  VmPowerState,
  McsServerMedia,
  McsServerStorageDevice,
  McsServerNic,
  McsServerSnapshot,
  McsServerCompute
} from '@app/models';
import { ServersApiService } from '../api-services/servers-api.service';

@Injectable()
export class ServersRepository extends McsRepositoryBase<McsServer> {

  private _resetSubject = new Subject<void>();

  constructor(
    private _serversApiService: ServersApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
    this._listenToAfterDataObtain();
  }

  /**
   * This will obtain the server disks values from API
   * and update the storage device of the active server
   * @param activeServer Active server to set storage device
   */
  public findServerDisks(activeServer: McsServer): Observable<McsServerStorageDevice[]> {
    return this._serversApiService.getServerStorage(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.storageDevices = this.updateRecordProperty(
            activeServer.storageDevices, response.content);
          this.updateRecord(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the server nics values from API
   * and update the nics of the active server
   * @param activeServer Active server to set the NICs
   */
  public findServerNics(activeServer: McsServer): Observable<McsServerNic[]> {
    return this._serversApiService.getServerNics(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.nics = this.updateRecordProperty(
            activeServer.nics, response.content);
          this.updateRecord(activeServer);
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
  public findServerCompute(activeServer: McsServer): Observable<McsServerCompute> {
    return this._serversApiService.getServerCompute(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.compute = this.updateRecordProperty(
            activeServer.compute, response.content);
          this.updateRecord(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the server medias values from API
   * and update the media of the active server
   * @param activeServer Active server to set the media
   */
  public findServerMedias(activeServer: McsServer): Observable<McsServerMedia[]> {
    return this._serversApiService.getServerMedias(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.media = this.updateRecordProperty(
            activeServer.media, response.content);
          this.updateRecord(activeServer);
          return response.content;
        })
      );
  }

  /**
   * Find all related snapshots from the server
   * @param serverId Server id where to get the snapshots
   */
  public findSnapshots(activeServer: McsServer): Observable<McsServerSnapshot[]> {
    return this._serversApiService.getServerSnapshots(activeServer.id)
      .pipe(
        map((response) => {
          activeServer.snapshots = this.updateRecordProperty(
            activeServer.snapshots, response.content);
          this.updateRecord(activeServer);
          return response.content;
        })
      );
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsServer[]>> {
    return this._serversApiService.getServers({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsServer>> {
    return this._serversApiService.getServer(recordId);
  }

  /**
   * Listens to after data obtained from api event
   */
  private _listenToAfterDataObtain(): void {
    this.afterDataObtainedFromApi.pipe(startWith(null))
      .subscribe(() => {
        // Drop the current subscription to prevent memory leak.
        this._resetSubject.next();
        this._registerJobEvents();
      });
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.createServerEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onCreateServer.bind(this));

    this._notificationEvents.cloneServerEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onCloneServer.bind(this));

    this._notificationEvents.renameServerEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onRenameServer.bind(this));

    this._notificationEvents.deleteServerEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onDeleteServer.bind(this));

    this._notificationEvents.changeServerPowerStateEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onPowerStateServer.bind(this));

    this._notificationEvents.updateServerComputeEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._onScaleServer.bind(this));

    this._notificationEvents.resetServerPasswordEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerDisk
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerDisk
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerDisk
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerNic
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerNic
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerNic
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerSnapshot
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.applyServerSnapshot
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerSnapshot
      .pipe(takeUntil(this._resetSubject))
      .subscribe(this._updateServerStatusByJob.bind(this));
  }

  /**
   * Event that emits when new server created
   * @param job Emitted job content
   */
  private _onCreateServer(job: McsJob): void {
    let successfullyCreated = !isNullOrEmpty(job) && job.dataStatus === DataStatus.Success;
    if (!successfullyCreated) { return; }
    this.refreshRecords();
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
      this.refreshRecords();
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
      this.deleteRecordById(activeServer.id);
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
    this.updateRecord(activeServer);
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
