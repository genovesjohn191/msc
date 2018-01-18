import { Injectable } from '@angular/core';
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
    this._notificationEvents.createServerEvent.subscribe(this._onCreateServer.bind(this));
    this._notificationEvents.cloneServerEvent.subscribe(this._onCreateServer.bind(this));
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
}
