import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
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
import { McsEntityJobManager } from './mcs-entity-job.manager';
import { McsMediaRepository } from '../repositories/mcs-media.repository';

@Injectable()
export class McsMediaJobManager extends McsEntityJobManager<McsResourceMedia>
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
