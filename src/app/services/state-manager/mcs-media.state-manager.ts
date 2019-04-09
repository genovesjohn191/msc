import { Injectable } from '@angular/core';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsJob,
  DataStatus,
  McsResourceMedia
} from '@app/models';
import { IMcsInitializable, CoreEvent } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEntityJobBaseStateManager } from './mcs-entity-job-base.state-manager';
import { McsMediaRepository } from '../repositories/mcs-media.repository';

@Injectable()
export class McsMediaStateManager extends McsEntityJobBaseStateManager<McsResourceMedia>
  implements IMcsInitializable, McsDisposable {

  private catalogItemCreateHandler: Subscription;

  constructor(
    eventDispatcher: EventBusDispatcherService,
    mediaRepository: McsMediaRepository
  ) {
    super(eventDispatcher, mediaRepository, 'mediaId');
  }

  /**
   * Initializes class properties / variables
   */
  public initialize(): void {
    this._registerEvents();
  }

  /**
   * Disposes the job manager instance
   */
  public dispose(): void {
    super.dispose();
    unsubscribeSafely(this.catalogItemCreateHandler);
  }

  /**
   * Event that emits when the entity should be updated
   * @param media Media entity to be updated
   * @param job Job entity that serves the data of the entity
   */
  protected onUpdateEntityState(media: McsResourceMedia, job: McsJob): void {
    media.isProcessing = job.dataStatus === DataStatus.InProgress;
    media.processingText = job.summaryInformation;
    this._entityRepository.addOrUpdate(media);
  }

  /**
   * Event that emits when the entity should be clear
   * @param media Media entity to be clear
   * @param job Job entity that serves the data of the entity
   */
  protected onClearEntityState(media: McsResourceMedia): void {
    media.isProcessing = false;
    media.processingText = null;
    this._entityRepository.addOrUpdate(media);
  }

  /**
   * Gets the entity update details based on the entity id
   * @param entityId Entity id of the entity to be updated
   */
  protected getEntityUpdateDetailsById(entityId: string): Observable<McsResourceMedia> {
    return this._entityRepository.getById(entityId);
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
    this.catalogItemCreateHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobResourceCatalogItemCreate, this._refreshServerListing.bind(this));
  }
}
