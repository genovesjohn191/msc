import {
  Injectable,
  EventEmitter
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsNotificationEventsService,
  McsApiJob,
  McsDataStatus
} from '../../core';
import { ServersService } from './servers.service';
import {
  Server,
  ServerCommand,
  ServerPowerState,
  ServerMedia,
  ServerStorageDevice,
  ServerNicSummary,
  ServerSnapshot
} from './models';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  compareNumbers,
  compareStrings
} from '../../utilities';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

  constructor(
    private _serversApiService: ServersService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
  }

  /**
   * This will obtain the server disks values from API
   * and update the storage device of the active server
   * @param activeServer Active server to set storage device
   */
  public findServerDisks(activeServer: Server): Observable<ServerStorageDevice[]> {
    return this._serversApiService.getServerStorage(activeServer.id)
      .map((response) => {
        activeServer.storageDevices = !isNullOrEmpty(response.content) ?
          response.content : new Array();

        // TODO: Sort this temporary by name since the disk doesnt have index field
        activeServer.storageDevices
          .sort((_first: ServerStorageDevice, _second: ServerStorageDevice) => {
            return compareStrings(_first.name, _second.name);
          });
        this.updateRecord(activeServer);
        return response.content;
      });
  }

  /**
   * This will obtain the server nics values from API
   * and update the nics of the active server
   * @param activeServer Active server to set storage device
   */
  public findServerNics(activeServer: Server): Observable<ServerNicSummary[]> {
    return this._serversApiService.getServerNics(activeServer.id)
      .map((response) => {
        activeServer.nics = !isNullOrEmpty(response.content) ?
          response.content : new Array();
        activeServer.nics.sort((_first: ServerNicSummary, _second: ServerNicSummary) => {
          return compareNumbers(_first.index, _second.index);
        });
        this.updateRecord(activeServer);
        return response.content;
      });
  }

  /**
   * Find all related snapshots from the server
   * @param serverId Server id where to get the snapshots
   */
  public findSnapshots(activeServer: Server): Observable<ServerSnapshot[]> {
    return this._serversApiService.getServerSnapshots(activeServer.id)
      .map((response) => {
        activeServer.snapshots = !isNullOrEmpty(response.content) ?
          response.content : new Array();
        this.updateRecord(activeServer);
        return response.content;
      });
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
    return this._serversApiService.getServer(recordId).map((response) => {
      this._updateServerFromCache(response.content);
      return response;
    });
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   *
   * `@Note:` We need to register the events after obtaining the data so that
   * we will get notified by the jobs when data is obtained
   */
  protected afterDataObtained(): void {
    this._registerJobEvents();
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
      .subscribe(this._onCreateServer.bind(this));

    this._notificationEvents.renameServerEvent
      .subscribe(this._onRenameServer.bind(this));

    this._notificationEvents.deleteServerEvent
      .subscribe(this._onDeleteServer.bind(this));

    this._notificationEvents.resetServerPasswordEvent
      .subscribe(this._onResetServerPassword.bind(this));

    this._notificationEvents.changeServerPowerStateEvent
      .subscribe(this._onPowerStateServer.bind(this));

    this._notificationEvents.scaleServerEvent
      .subscribe(this._onScaleServer.bind(this));

    this._notificationEvents.attachServerMediaEvent
      .subscribe(this._onAttachServerMedia.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .subscribe(this._onDetachServerMedia.bind(this));

    this._notificationEvents.createServerDisk
      .subscribe(this._onCreateServerDisk.bind(this));

    this._notificationEvents.updateServerDisk
      .subscribe(this._onModifyServerDisk.bind(this));

    this._notificationEvents.deleteServerDisk
      .subscribe(this._onModifyServerDisk.bind(this));

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
   * Event that emits when the server deleted
   * @param job Emitted job content
   */
  private _onDeleteServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let deletedServer = this._getServerByJob(job);
    if (!isNullOrEmpty(deletedServer)) {
      this._setServerProcessDetails(deletedServer, job);
      if (job.dataStatus === McsDataStatus.Success) {
        this.deleteRecordById(job.clientReferenceObject.serverId);
      }
    }
  }

  /**
   * Event that emits when server is renamed
   * @param job Emitted job content
   */
  private _onRenameServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let renamedServer = this._getServerByJob(job);
    if (!isNullOrEmpty(renamedServer)) {
      this._setServerProcessDetails(renamedServer, job);
      if (job.dataStatus === McsDataStatus.Success) {
        renamedServer.name = job.clientReferenceObject.newName;
      }
      this.updateRecord(renamedServer);
    }
  }

  /**
   * Event that emits when the server command is executed
   * @param job Emitted job content
   */
  private _onPowerStateServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);
    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
      if (job.dataStatus === McsDataStatus.Success) {
        this._updateServerPowerState(activeServer);
      }

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when the server reset password command is executed
   * @param job Emitted job content
   */
  private _onResetServerPassword(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);
    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
    }
  }

  /**
   * Event that emits when scaling a server
   * @param job Emitted job content
   */
  private _onScaleServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      if (job.dataStatus === McsDataStatus.Success && !isNullOrEmpty(activeServer.compute)) {
        activeServer.compute.memoryMB = job.clientReferenceObject.memoryMB;
        activeServer.compute.cpuCount = job.clientReferenceObject.cpuCount;
        activeServer.compute.coreCount = 1;
      }

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when attaching a server media
   * @param job Emitted job content
   */
  private _onAttachServerMedia(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      let media = new ServerMedia();
      media.name = job.clientReferenceObject.mediaName;
      media.isProcessing = activeServer.isProcessing;

      if (!media.isProcessing) {
        // Delete the mocked media record from the list
        deleteArrayRecord(activeServer.media, (targetMedia) => {
          return isNullOrEmpty(targetMedia.id);
        }, 1);

        if (job.dataStatus === McsDataStatus.Error) { return; }
      }

      if (job.dataStatus === McsDataStatus.Success) {
        let referenceObject = job.tasks[0].referenceObject;

        if (!isNullOrEmpty(referenceObject.resourceId)) {
          media.id = referenceObject.resourceId;
        }
      }

      // Append a mock media record while job is processing
      // Update the media list when job has completed
      addOrUpdateArrayRecord(activeServer.media, media, false,
        (_existingMedia: ServerMedia) => _existingMedia.id === media.id);

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when detaching a server media
   * @param job Emitted job content
   */
  private _onDetachServerMedia(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      let media = activeServer.media.find((result) => {
        return result.id === job.clientReferenceObject.mediaId;
      });

      if (!isNullOrEmpty(media)) {
        media.isProcessing = activeServer.isProcessing;

        if (job.dataStatus === McsDataStatus.Success) {
          deleteArrayRecord(activeServer.media, (targetMedia) => {
            return media.id === targetMedia.id;
          });
        }
      }
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when creating a server disk
   * @param job Emitted job content
   */
  private _onCreateServerDisk(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when either updating or deleting a server disk
   * @param job Emitted job content
   */
  private _onModifyServerDisk(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      if (!isNullOrEmpty(activeServer.storageDevices)) {
        let disk = activeServer.storageDevices.find((result) => {
          return result.id === job.clientReferenceObject.diskId;
        });
        if (!isNullOrEmpty(disk)) {
          disk.isProcessing = activeServer.isProcessing;
        }
      }
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
      let nic = activeServer.nics.find((result) => {
        return result.id === job.clientReferenceObject.nicId;
      });

      if (!isNullOrEmpty(nic)) {
        nic.isProcessing = activeServer.isProcessing;
      }
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when create server snapshot triggered
   * @param job Emitted job content
   */
  private _onCreateServerSnapshot(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      if (isNullOrEmpty(activeServer.snapshots)) {
        // We need to fake the date in order for us to check
        // when the snapshot is currently creating
        let snapshot = new ServerSnapshot();
        snapshot.isProcessing = activeServer.isProcessing;
        activeServer.snapshots.push(snapshot);
      } else {
        activeServer.snapshots[0].isProcessing = this._getProcessingFlagByJob(job);
      }

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when applying server snapshot triggered
   * @param job Emitted job content
   */
  private _onApplyServerSnapshot(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);
    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      if (!isNullOrEmpty(activeServer.snapshots)) {
        activeServer.snapshots[0].isProcessing = this._getProcessingFlagByJob(job);
      }
      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when deleting server snapshot triggered
   * @param job Emitted job content
   */
  private _onDeleteServerSnapshot(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this._getServerByJob(job);
    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      // Clear the snapshot as mock data on the repository in case of completion
      if (!isNullOrEmpty(activeServer.snapshots)) {
        activeServer.snapshots[0].isProcessing = this._getProcessingFlagByJob(job);
      }
      if (job.dataStatus === McsDataStatus.Success) {
        activeServer.snapshots = undefined;
      }
      this.updateRecord(activeServer);
    }
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
   * Update the corresponding server based on cache date considering all
   * the current status of the server
   *
   * `@Note:` This is needed since the obtained server doesn't have yet the
   * local properties settings in which the basis of the server if it has
   * an on-going job.
   * @param record Record to be updated
   */
  private _updateServerFromCache(record: Server): void {
    if (isNullOrEmpty(this.dataRecords)) { return; }

    let recordFound = this.dataRecords.find((server) => {
      return record.id === server.id;
    });
    if (isNullOrEmpty(recordFound)) { return; }
    record.isProcessing = recordFound.isProcessing;
    record.processingText = recordFound.processingText;
    record.commandAction = recordFound.commandAction;
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
  private _getServerByJob(job: McsApiJob) {
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
