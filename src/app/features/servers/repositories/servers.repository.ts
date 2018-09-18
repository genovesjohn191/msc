import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsNotificationEventsService,
  McsApiJob,
  McsDataStatus,
  McsDialogService,
  McsAuthenticationIdentity
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import {
  Server,
  ServerCommand,
  ServerPowerState,
  ServerMedia,
  ServerStorageDevice,
  ServerNic,
  ServerSnapshot,
  ServerCompute
} from '../models';
import { ServersService } from '../servers.service';
import { ResetPasswordFinishedDialogComponent } from '../shared';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

  constructor(
    private _serversApiService: ServersService,
    private _notificationEvents: McsNotificationEventsService,
    private _dialogService: McsDialogService,
    private _authIdentity: McsAuthenticationIdentity
  ) {
    super();
    this._registerJobEvents();
  }

  /**
   * This will obtain the server disks values from API
   * and update the storage device of the active server
   * @param activeServer Active server to set storage device
   */
  public findServerDisks(activeServer: Server): Observable<ServerStorageDevice[]> {
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
  public findServerNics(activeServer: Server): Observable<ServerNic[]> {
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
  public findServerCompute(activeServer: Server): Observable<ServerCompute> {
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
  public findServerMedias(activeServer: Server): Observable<ServerMedia[]> {
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
  public findSnapshots(activeServer: Server): Observable<ServerSnapshot[]> {
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
  ): Observable<McsApiSuccessResponse<Server[]>> {
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Server>> {
    return this._serversApiService.getServer(recordId);
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.createServerEvent
      .subscribe(this._onCreateServer.bind(this));

    this._notificationEvents.cloneServerEvent
      .subscribe(this._onCloneServer.bind(this));

    this._notificationEvents.renameServerEvent
      .subscribe(this._onRenameServer.bind(this));

    this._notificationEvents.deleteServerEvent
      .subscribe(this._onDeleteServer.bind(this));

    this._notificationEvents.resetServerPasswordEvent
      .subscribe(this._onResetServerPassword.bind(this));

    this._notificationEvents.changeServerPowerStateEvent
      .subscribe(this._onPowerStateServer.bind(this));

    this._notificationEvents.updateServerComputeEvent
      .subscribe(this._onScaleServer.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerDisk
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerDisk
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerDisk
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerNic
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.updateServerNic
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerNic
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.createServerSnapshot
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.applyServerSnapshot
      .subscribe(this._updateServerStatusByJob.bind(this));

    this._notificationEvents.deleteServerSnapshot
      .subscribe(this._updateServerStatusByJob.bind(this));
  }

  /**
   * Event that emits when new server created
   * @param job Emitted job content
   */
  private _onCreateServer(job: McsApiJob): void {
    let successfullyCreated = !isNullOrEmpty(job) && job.dataStatus === McsDataStatus.Success;
    if (!successfullyCreated) { return; }
    this.refreshRecords();
  }

  /**
   * Event that emits when cloning a server
   * @param job Emitted job content
   */
  private _onCloneServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    let clonedServer = this._getServerByJob(job);
    if (!isNullOrEmpty(clonedServer)) {
      this._setServerProcessDetails(clonedServer, job);
    }

    if (job.dataStatus === McsDataStatus.Success) {
      this.refreshRecords();
    }
  }

  /**
   * Event that emits when the server deleted
   * @param job Emitted job content
   */
  private _onDeleteServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._updateServerStatusByJob(job);
    if (job.dataStatus === McsDataStatus.Success) {
      this.deleteRecordById(activeServer.id);
    }
  }

  /**
   * Event that emits when server is renamed
   * @param job Emitted job content
   */
  private _onRenameServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === McsDataStatus.Success) {
      activeServer.name = job.clientReferenceObject.newName;
    }
    this._updateServerStatusByJob(job);
  }

  /**
   * Event that emits when the server command is executed
   * @param job Emitted job content
   */
  private _onPowerStateServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === McsDataStatus.Success) {
      this._updateServerPowerState(activeServer);
    }
    this._updateServerStatusByJob(job);
  }

  /**
   * Event that emits when the server reset password command is executed
   * @param job Emitted job content
   */
  private _onResetServerPassword(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }
    this._updateServerStatusByJob(job);

    let resetSuccessfully = job.dataStatus === McsDataStatus.Success
      && job.clientReferenceObject.userId === this._authIdentity.user.userId
      && !isNullOrEmpty(job.tasks);
    if (!resetSuccessfully) { return; }

    // Show the dialog when reset password was successfull
    let credentialObject = job.tasks[0].referenceObject.credential;
    this._dialogService.open(ResetPasswordFinishedDialogComponent, {
      id: 'reset-vm-password-confirmation',
      data: credentialObject,
      size: 'medium',
      disableClose: true
    });
  }

  /**
   * Event that emits when scaling a server
   * @param job Emitted job content
   */
  private _onScaleServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    if (job.dataStatus === McsDataStatus.Success && !isNullOrEmpty(activeServer.compute)) {
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
  private _setServerProcessDetails(activeServer: Server, job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    activeServer.isProcessing = this._getProcessingFlagByJob(job);
    activeServer.commandAction = job.clientReferenceObject.commandAction;
    activeServer.processingText = job.summaryInformation;
  }

  /**
   * Updates the server status based on the job
   */
  private _updateServerStatusByJob(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * This will update the server power state
   * based on the command action
   * @param activeServer Active server
   */
  private _updateServerPowerState(activeServer: Server): void {
    if (isNullOrEmpty(activeServer)) { return; }

    switch (activeServer.commandAction) {
      case ServerCommand.Start:
      case ServerCommand.Restart:
      case ServerCommand.Resume:
        activeServer.powerState = ServerPowerState.PoweredOn;
        break;

      case ServerCommand.Stop:
        activeServer.powerState = ServerPowerState.PoweredOff;
        break;

      case ServerCommand.Suspend:
        activeServer.powerState = ServerPowerState.Suspended;
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
  private _getServerByJob(job: McsApiJob): Server {
    if (isNullOrEmpty(job)) { return undefined; }
    return this.dataRecords.find((serverItem) => {
      return !isNullOrEmpty(job) && !isNullOrEmpty(job.clientReferenceObject)
        && serverItem.id === job.clientReferenceObject.serverId;
    });
  }

  /**
   * Returns the processing flag based on job status
   */
  private _getProcessingFlagByJob(job: McsApiJob): boolean {
    if (isNullOrEmpty(job)) { return false; }
    return job.dataStatus === McsDataStatus.InProgress;
  }
}
