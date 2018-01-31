import {
  Injectable,
  EventEmitter
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsNotificationEventsService,
  McsApiJob,
  CoreDefinition
} from '../../core';
import { ServersService } from './servers.service';
import {
  Server,
  ServerCommand,
  ServerPowerState,
  ServerMedia,
  ServerStorageDevice,
  ServerNicSummary
} from './models';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord
} from 'app/utilities';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

  /** Subscriptions */
  public updateDisksSubscription: Subscription;
  public updateNicsSubscription: Subscription;

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();
  private _initial: boolean = true;

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
  public updateServerDisks(activeServer: Server): void {
    this.updateDisksSubscription = this._serversApiService.getServerStorage(activeServer.id)
      .subscribe((response) => {
        activeServer.storageDevice = response.content as ServerStorageDevice[];
        this.updateRecord(activeServer);
      });
  }

  /**
   * This will obtain the server nics values from API
   * and update the nics of the active server
   * @param activeServer Active server to set storage device
   */
  public updateServerNics(activeServer: Server): void {
    this.updateNicsSubscription = this._serversApiService.getServerNetworks(activeServer.id)
      .subscribe((response) => {
        activeServer.nics = response.content as ServerNicSummary[];
        this.updateRecord(activeServer);
      });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(recordCount: number): Observable<McsApiSuccessResponse<Server[]>> {
    return this._serversApiService.getServers({
      perPage: recordCount
    }).finally(() => {
      // We need to register the events after obtaining the data so that
      // we will get notified by the jobs when data is obtained
      if (this._initial === true) {
        this._registerJobEvents();
        this._initial = false;
      }
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
    this._notificationEvents.notificationsEvent.subscribe(this._onNotificationsChanged.bind(this));
    this._notificationEvents.createServerEvent.subscribe(this._onCreateServer.bind(this));
    this._notificationEvents.cloneServerEvent.subscribe(this._onCreateServer.bind(this));
    this._notificationEvents.renameServerEvent.subscribe(this._onRenameServer.bind(this));
    this._notificationEvents.deleteServerEvent.subscribe(this._onDeleteServer.bind(this));
    this._notificationEvents.resetServerPasswordEvent
      .subscribe(this._onResetServerPassword.bind(this));
    this._notificationEvents.changeServerPowerStateEvent
      .subscribe(this._onPowerStateServer.bind(this));
    this._notificationEvents.scaleServerEvent.subscribe(this._onScaleServer.bind(this));
    this._notificationEvents.attachServerMediaEvent.subscribe(this._onAttachServerMedia.bind(this));
    this._notificationEvents.detachServerMediaEvent.subscribe(this._onDetachServerMedia.bind(this));
    this._notificationEvents.createServerDisk.subscribe(this._onCreateServerDisk.bind(this));
    this._notificationEvents.updateServerDisk.subscribe(this._onModifyServerDisk.bind(this));
    this._notificationEvents.deleteServerDisk.subscribe(this._onModifyServerDisk.bind(this));
    this._notificationEvents.createServerNetwork.subscribe(this._onCreateServerNetwork.bind(this));
    this._notificationEvents.updateServerNetwork.subscribe(this._onModifyServerNetwork.bind(this));
    this._notificationEvents.deleteServerNetwork.subscribe(this._onModifyServerNetwork.bind(this));
  }

  /**
   * Event that emits when new server created
   * @param job Emitted job content
   */
  private _onCreateServer(job: McsApiJob): void {
    if (isNullOrEmpty(job) || job.status !== CoreDefinition.NOTIFICATION_JOB_COMPLETED) { return; }
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
      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
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
      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
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

      if (activeServer.isProcessing) {
        activeServer.powerState = undefined;
      }

      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
        activeServer.powerState = activeServer.commandAction === ServerCommand.Stop ?
          ServerPowerState.PoweredOff : activeServer.commandAction === ServerCommand.Start ||
            activeServer.commandAction === ServerCommand.Restart ?
            ServerPowerState.PoweredOn : activeServer.powerState;
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

      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED
       && !isNullOrEmpty(activeServer.compute)) {
        activeServer.compute.memoryMB = job.clientReferenceObject.memoryMB;
        activeServer.compute.cpuCount = job.clientReferenceObject.cpuCount;
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

        if (job.status === CoreDefinition.NOTIFICATION_JOB_FAILED) { return; }
      }

      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
        let referenceObject = job.tasks[0].referenceObject;

        if (!isNullOrEmpty(referenceObject.resourceId)) {
          media.id = referenceObject.resourceId;
        }
      }

      // Append a mock media record while job is processing
      // Update the media list when job has completed
      addOrUpdateArrayRecord(activeServer.media, media, false,
        (_first: any, _second: any) => {
          return _first.id === _second.id;
        });

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

        if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
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

      let disk = new ServerStorageDevice();
      disk.name = job.clientReferenceObject.name;
      disk.sizeMB = job.clientReferenceObject.sizeMB;
      disk.storageProfile = job.clientReferenceObject.storageProfile;
      disk.isProcessing = activeServer.isProcessing;

      // Append a mock disk record while job is processing
      // Or delete the mocked disk record when job has completed or failed
      if (disk.isProcessing) {
        addOrUpdateArrayRecord(activeServer.storageDevice, disk, false,
          (_first: any, _second: any) => {
            return _first.id === _second.id;
          });
      } else {
        deleteArrayRecord(activeServer.storageDevice, (targetNic) => {
          return isNullOrEmpty(targetNic.id);
        }, 1);
      }

      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
        this.updateServerDisks(activeServer);
      }

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

      if (!isNullOrEmpty(activeServer.storageDevice)) {
        let disk = activeServer.storageDevice.find((result) => {
          return result.id === job.clientReferenceObject.diskId;
        });

        if (!isNullOrEmpty(disk)) {
          disk.isProcessing = activeServer.isProcessing;

          if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
            this.updateServerDisks(activeServer);
          }
        }
      }

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNetwork(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      let nic = new ServerNicSummary();
      nic.name = job.clientReferenceObject.networkName;
      nic.isProcessing = activeServer.isProcessing;

      // Append a mock nic record while job is processing
      // Or refresh the list using api call when job has completed or failed
      if (nic.isProcessing) {
        addOrUpdateArrayRecord(activeServer.nics, nic, false,
          (_first: any, _second: any) => {
            return _first.id === _second.id;
          });
      } else {
        this.updateServerNics(activeServer);
      }

      this.updateRecord(activeServer);
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNetwork(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    let activeServer = this._getServerByJob(job);

    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);

      let nic = activeServer.storageDevice.find((result) => {
        return result.id === job.clientReferenceObject.nicId;
      });

      if (!isNullOrEmpty(nic)) {
        nic.isProcessing = activeServer.isProcessing;

        if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
          this.updateServerNics(activeServer);
        }
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
    activeServer.isProcessing = !!(job.status === CoreDefinition.NOTIFICATION_JOB_PENDING)
      || !!(job.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE);
    activeServer.commandAction = job.clientReferenceObject.commandAction;
    activeServer.processingText = job.summaryInformation;
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
}
