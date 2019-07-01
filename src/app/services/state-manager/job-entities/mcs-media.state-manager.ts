import { Injector } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsJob,
  JobType,
  McsResourceMedia,
  McsMediaJobReference
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsJobEntityStrategy } from './base/mcs-job-entity.strategy';
import { McsMediaRepository } from '../../repositories/mcs-media.repository';

export class McsMediaStateManager extends McsJobEntityStrategy<McsResourceMedia, McsMediaJobReference> {

  private readonly _mediaRepository: McsMediaRepository;

  constructor(_injector: Injector) {
    super();
    this._mediaRepository = _injector.get(McsMediaRepository);
  }

  /**
   * Event that emits when the servers data has been changed
   */
  public dataChange(): Observable<McsResourceMedia[]> {
    return this._mediaRepository.dataChange();
  }

  /**
   * Gets the reference object key
   */
  public getReferenceObjectKey(): keyof McsMediaJobReference {
    return 'mediaId';
  }

  /**
   * Gets the existing entity details from the cache
   * @param job Job to be the basis of the entity
   */
  public getExistingEntityDetails(job: McsJob): Observable<McsResourceMedia> {
    if (isNullOrEmpty(job)) { return of(null); }
    let mediaId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this.getReferenceObjectKey()]);
    return this._mediaRepository.getBy((item) => item.id === mediaId);
  }

  /**
   * Gets the updated entity details from API
   * @param job Job to be the basis of the entity
   */
  public getUpdatedEntityDetails(job: McsJob): Observable<McsResourceMedia> {
    if (isNullOrEmpty(job)) { return of(null); }
    let mediaId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this.getReferenceObjectKey()]);
    let entityRequiredForUpdate = job.type !== JobType.CreateResourceCatalogItem;

    if (!entityRequiredForUpdate) {
      this._mediaRepository.clearData();
      return of(null);
    }
    return this._mediaRepository.getById(mediaId);
  }

  /**
   * Updates the entity state
   * @param entity Entity reference to be updated
   * @param job Job on where to get the details
   */
  public updateEntityState(entity: McsResourceMedia, job: McsJob): void {
    entity.processingText = job.summaryInformation;
    entity.isProcessing = true;
  }

  /**
   * Clears the entity state
   * @param entity Entity reference to be updated
   * @param job Job on where to get the details
   */
  public clearEntityState(entity: McsResourceMedia, _job: McsJob): void {
    entity.isProcessing = false;
    entity.processingText = null;
  }
}
