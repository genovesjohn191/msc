import { Injectable } from '@angular/core';
import {
  Subscription,
  Observable,
  of
} from 'rxjs';
import {
  McsDisposable,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsJob,
  McsServer,
  JobType,
  DataStatus
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { McsServersRepository } from '@app/services';
import { IMcsInitializable } from '../interfaces/mcs-initializable.interface';
import { McsJobEntityStateManager } from './base/mcs-job-entity.state-manager';

@Injectable()
export class McsServerStateManager extends McsJobEntityStateManager<McsServer>
  implements IMcsInitializable, McsDisposable {

  private _serverCreateHandler: Subscription;
  private _serverCloneHandler: Subscription;
  private _serverDeleteHandler: Subscription;

  constructor(
    eventDispatcher: EventBusDispatcherService,
    serversRepository: McsServersRepository
  ) {
    super(eventDispatcher, serversRepository, 'serverId');
  }

  /**
   * Initializes class properties / variables
   */
  public initialize(): void {
    this._registerEvents();
  }

  /**
   * Disposes the server job manager instance
   */
  public dispose(): void {
    super.dispose();
    unsubscribeSafely(this._serverCreateHandler);
    unsubscribeSafely(this._serverCloneHandler);
    unsubscribeSafely(this._serverDeleteHandler);
  }

  /**
   * Event that emits when the entity should be updated
   * @param server Server entity to be updated
   * @param job Job entity that serves the data of the entity
   */
  protected onUpdateEntityState(server: McsServer, job: McsJob): void {
    let summaryInformation = getSafeProperty(job, (obj) => obj.summaryInformation);

    if (job.type === JobType.DeleteServer) { server.isDisabled = true; }
    server.isProcessing = true;
    server.processingText = summaryInformation;
    this._entityRepository.addOrUpdate(server);
  }

  /**
   * Event that emits when the entity should be clear
   * @param server Server entity to be clear
   * @param job Job entity that serves the data of the entity
   */
  protected onClearEntityState(server: McsServer): void {
    server.isProcessing = false;
    server.isDisabled = false;
    server.processingText = null;
    this._entityRepository.addOrUpdate(server);
  }

  /**
   * Gets the entity update details based on the entity id
   * @param entityId Entity id of the entity to be updated
   */
  protected getEntityUpdateDetailsById(entityId: string, job: McsJob): Observable<McsServer> {
    let entityRequiredForUpdate = job.type !== JobType.DeleteServer &&
      job.type !== JobType.CloneServer &&
      job.type !== JobType.CreateServer;
    return entityRequiredForUpdate ? this._entityRepository.getById(entityId) : of(null);
  }

  /**
   * Refresh the server listing repository data
   * @param job emitted job
   */
  private _refreshServerListing(job: McsJob): void {
    if (job.dataStatus !== DataStatus.Success) { return; }
    this._entityRepository.clearData();
  }

  /**
   * Registers all the events
   */
  private _registerEvents(): void {
    this._serverCreateHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerCreate, this._refreshServerListing.bind(this));

    this._serverCloneHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerClone, this._refreshServerListing.bind(this));

    this._serverDeleteHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerDelete, this._refreshServerListing.bind(this));
  }
}
