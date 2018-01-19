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
import { Server } from './models';
import { isNullOrEmpty } from 'app/utilities';

@Injectable()
export class ServersRepository extends McsRepositoryBase<Server> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

  constructor(
    private _serversApiService: ServersService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
    this._registerJobEvents();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(recordCount: number): Observable<McsApiSuccessResponse<Server[]>> {
    return this._serversApiService.getServers({
      perPage: recordCount
    });
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
    if (isNullOrEmpty(job) || job.status !== CoreDefinition.NOTIFICATION_JOB_COMPLETED) { return; }
    this.deleteRecordById(job.clientReferenceObject.serverId);
  }

  /**
   * Event that emits when server is renamed
   * @param job Emitted job content
   */
  private _onRenameServer(job: McsApiJob): void {
    if (isNullOrEmpty(job) || job.status !== CoreDefinition.NOTIFICATION_JOB_COMPLETED) { return; }
    let renamedServer = this.dataRecords
      .find((serverItem) => {
        return serverItem.id === job.clientReferenceObject.serverId;
      });
    if (!isNullOrEmpty(renamedServer)) {
      renamedServer.name = job.clientReferenceObject.newName;
    }
    this.updateRecord(renamedServer);
  }

  /**
   * Event that emits when any notifications changes
   * @param jobs Emitted jobs content
   */
  private _onNotificationsChanged(jobs: McsApiJob[]): void {
    this.notificationsChanged.emit(jobs);
  }
}
