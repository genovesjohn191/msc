import { Injector } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsServer,
  McsJob,
  JobType,
  McsServerJobReference
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsJobEntityStrategy } from './base/mcs-job-entity.strategy';
import { McsServersRepository } from '../../repositories/mcs-servers.repository';

export class McsServerStateManager extends McsJobEntityStrategy<McsServer, McsServerJobReference> {

  private readonly _serversRepository: McsServersRepository;

  constructor(_injector: Injector) {
    super();
    this._serversRepository = _injector.get(McsServersRepository);
  }

  /**
   * Event that emits when the servers data has been changed
   */
  public dataChange(): Observable<McsServer[]> {
    return this._serversRepository.dataChange();
  }

  /**
   * Gets the reference object key
   */
  public getReferenceObjectKey(): keyof McsServerJobReference {
    return 'serverId';
  }

  /**
   * Gets the existing entity details from the cache
   * @param job Job to be the basis of the entity
   */
  public getExistingEntityDetails(job: McsJob): Observable<McsServer> {
    if (isNullOrEmpty(job)) { return of(null); }
    let serverId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this.getReferenceObjectKey()]);
    return this._serversRepository.getBy((item) => item.id === serverId);
  }

  /**
   * Gets the updated entity details from API
   * @param job Job to be the basis of the entity
   */
  public getUpdatedEntityDetails(job: McsJob): Observable<McsServer> {
    if (isNullOrEmpty(job)) { return of(null); }
    let serverId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this.getReferenceObjectKey()]);
    let entityRequiredForUpdate = job.type !== JobType.DeleteServer &&
      job.type !== JobType.CloneServer &&
      job.type !== JobType.CreateServer;

    if (!entityRequiredForUpdate) {
      this._serversRepository.clearData();
      return of(null);
    }

    return this._serversRepository.getById(serverId);
  }

  /**
   * Updates the entity state
   * @param entity Entity reference to be updated
   * @param job Job on where to get the details
   */
  public updateEntityState(entity: McsServer, job: McsJob): void {
    entity.isDisabled = job.type === JobType.DeleteServer;
    entity.processingText = job.summaryInformation;
    entity.isProcessing = true;
  }

  /**
   * Clears the entity state
   * @param entity Entity reference to be updated
   * @param job Job on where to get the details
   */
  public clearEntityState(entity: McsServer, _job: McsJob): void {
    entity.isDisabled = false;
    entity.isProcessing = false;
    entity.processingText = null;
  }
}
