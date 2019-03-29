import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsDisposable,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  CoreEvent,
  IMcsInitializable
} from '@app/core';
import {
  McsJob,
  McsServer
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsServersRepository } from '../repositories/mcs-servers.repository';
import { McsEntityJobManager } from './mcs-entity-job.manager';

@Injectable()
export class McsServersJobManager extends McsEntityJobManager<McsServer>
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
    let commandActionTriggered = getSafeProperty(job, (obj) => obj.clientReferenceObject.commandAction);
    let summaryInformation = getSafeProperty(job, (obj) => obj.summaryInformation);

    server.isProcessing = true;
    server.commandAction = commandActionTriggered;
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
    server.commandAction = null;
    server.processingText = null;
    this._entityRepository.addOrUpdate(server);
  }

  /**
   * Refresh the server listing repository data
   */
  private _refreshServerListing(): void {
    this._entityRepository.clearData();
  }

  /**
   * Registers all the events
   */
  private _registerEvents(): void {
    this._serverCreateHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerCreate, this._refreshServerListing.bind(this));

    this._serverCloneHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerClone, this._refreshServerListing.bind(this));

    this._serverDeleteHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerDelete, this._refreshServerListing.bind(this));
  }
}
