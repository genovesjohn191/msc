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
  CoreDefinition
} from '../../core';
import { ServersService } from './servers.service';
import {
  Server,
  ServerCommand,
  ServerPowerState
} from './models';
import { isNullOrEmpty } from 'app/utilities';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

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
   * This will be automatically called in the repoistory based class
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
    let deletedServer = this.dataRecords.find((serverItem) => {
      return serverItem.id === job.clientReferenceObject.serverId;
    });
    if (!isNullOrEmpty(deletedServer)) {
      this._setServerProcessDetails(deletedServer, job);
      if (job.status !== CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
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
    let renamedServer = this.dataRecords.find((serverItem) => {
      return serverItem.id === job.clientReferenceObject.serverId;
    });
    if (!isNullOrEmpty(renamedServer)) {
      this._setServerProcessDetails(renamedServer, job);
      if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
        renamedServer.name = job.clientReferenceObject.newName;
      }
    }
    this.updateRecord(renamedServer);
  }

  /**
   * Event that emits when the server command is executed
   * @param job Emitted job content
   */
  private _onPowerStateServer(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    let activeServer = this.dataRecords.find((serverItem) => {
      return serverItem.id === job.clientReferenceObject.serverId;
    });
    if (!isNullOrEmpty(activeServer)) {
      activeServer.isProcessing = !!(job.status === CoreDefinition.NOTIFICATION_JOB_PENDING)
        || !!(job.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE);
      activeServer.commandAction = job.clientReferenceObject.commandAction;
      activeServer.processingText = job.summaryInformation;

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
    let activeServer = this.dataRecords.find((serverItem) => {
      return serverItem.id === job.clientReferenceObject.serverId;
    });
    if (!isNullOrEmpty(activeServer)) {
      this._setServerProcessDetails(activeServer, job);
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
}
