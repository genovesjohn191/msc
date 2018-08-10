import {
  Injectable,
  EventEmitter
} from '@angular/core';
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
} from '../../core';
import { ServersService } from './servers.service';
import {
  Server,
  ServerCommand,
  ServerPowerState,
  ServerMedia,
  ServerStorageDevice,
  ServerNic,
  ServerSnapshot,
  ServerCompute
} from './models';
import { isNullOrEmpty } from '../../utilities';
import { ResetPasswordFinishedDialogComponent } from './shared';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

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
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   *
   * `@Note:` We need to register the events after obtaining the data so that
   * we will get notified by the jobs when data is obtained
   */
  protected afterDataObtained(): void {
    this._notificationEvents.notifyNotificationsSubscribers();
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.notificationsEvent
      .subscribe(this._onNotificationsChanged.bind(this));

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
      .subscribe(this._onAttachServerMedia.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .subscribe(this._onDetachServerMedia.bind(this));

    this._notificationEvents.createServerDisk
      .subscribe(this._onCreateServerDisk.bind(this));

    this._notificationEvents.updateServerDisk
      .subscribe(this._onUpdateServerDisk.bind(this));

    this._notificationEvents.deleteServerDisk
      .subscribe(this._onUpdateServerDisk.bind(this));

    this._notificationEvents.createServerNic
      .subscribe(this._onCreateServerNic.bind(this));

    this._notificationEvents.updateServerNic
      .subscribe(this._onModifyServerNic.bind(this));

    this._notificationEvents.deleteServerNic
      .subscribe(this._onModifyServerNic.bind(this));

    this._notificationEvents.createServerSnapshot
      .subscribe(this._onCreateServerSnapshot.bind(this));

    this._notificationEvents.applyServerSnapshot
      .subscribe(this._onApplyServerSnapshot.bind(this));

    this._notificationEvents.deleteServerSnapshot
      .subscribe(this._onDeleteServerSnapshot.bind(this));
  }

  /**
   * Event that emits when new server created
   * @param job Emitted job content
   */
  private _onCreateServer(job: McsApiJob): void {
    if (isNullOrEmpty(job) || job.dataStatus !== McsDataStatus.Success) { return; }
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

    this._setServerProcessDetails(activeServer, job);
    if (job.dataStatus === McsDataStatus.Success) {
      this.deleteRecordById(activeServer.id);
      return;
    }
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when server is renamed
   * @param job Emitted job content
   */
  private _onRenameServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    if (job.dataStatus === McsDataStatus.Success) {
      activeServer.name = job.clientReferenceObject.newName;
    }
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when the server command is executed
   * @param job Emitted job content
   */
  private _onPowerStateServer(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    if (job.dataStatus === McsDataStatus.Success) {
      this._updateServerPowerState(activeServer);
    }
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when the server reset password command is executed
   * @param job Emitted job content
   */
  private _onResetServerPassword(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);

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

    this._setServerProcessDetails(activeServer, job);
    if (job.dataStatus === McsDataStatus.Success && !isNullOrEmpty(activeServer.compute)) {
      activeServer.compute.memoryMB = job.clientReferenceObject.memoryMB;
      activeServer.compute.cpuCount = job.clientReferenceObject.cpuCount;
      activeServer.compute.coreCount = 1;
    }
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when attaching a server media
   * @param job Emitted job content
   */
  private _onAttachServerMedia(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when detaching a server media
   * @param job Emitted job content
   */
  private _onDetachServerMedia(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when either updating or deleting a server disk
   * @param job Emitted job content
   */
  private _onUpdateServerDisk(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    let hasServerNics = !isNullOrEmpty(activeServer.nics);
    if (!hasServerNics) { return; }

    this._setServerProcessDetails(activeServer, job);
    let nic = activeServer.nics.find((result) => {
      return result.id === job.clientReferenceObject.nicId;
    });
    if (!isNullOrEmpty(nic)) { nic.isProcessing = activeServer.isProcessing; }
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when create server snapshot triggered
   * @param job Emitted job content
   */
  private _onCreateServerSnapshot(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when applying server snapshot triggered
   * @param job Emitted job content
   */
  private _onApplyServerSnapshot(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when deleting server snapshot triggered
   * @param job Emitted job content
   */
  private _onDeleteServerSnapshot(job: McsApiJob): void {
    let activeServer = this._getServerByJob(job);
    if (isNullOrEmpty(activeServer)) { return; }

    this._setServerProcessDetails(activeServer, job);
    this.updateRecord(activeServer);
  }

  /**
   * Event that emits when any notifications changes
   * @param jobs Emitted jobs content
   */
  private _onNotificationsChanged(jobs: McsApiJob[]): void {
    this.notificationsChanged.emit(jobs);
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
