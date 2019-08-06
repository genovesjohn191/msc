import {
  Observable,
  of
} from 'rxjs';
import {
  McsEntityBase,
  McsJob,
  ActionStatus,
  EntityRequester
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { IMcsJobEntity } from './mcs-job-entity.interface';
import { McsRepository } from '../../core/mcs-repository.interface';

export abstract class McsJobEntityBase<T extends McsEntityBase> implements IMcsJobEntity<T> {

  constructor(
    protected entityRequester: EntityRequester,
    protected entityRepository: McsRepository<T>,
    protected actionStatus: ActionStatus
  ) { }

  /**
   * Events that emits when the data has been changed
   */
  public dataChange(): Observable<T[]> {
    return this.entityRepository.dataChange();
  }

  /**
   * Gets the entity requester type
   */
  public getEntityRequesterType(): EntityRequester {
    return this.entityRequester;
  }

  /**
   * Gets the action method registered from the entity
   */
  public getActionMethod(): ActionStatus {
    return this.actionStatus;
  }

  /**
   * Gets the entity id the based on the job registered
   * @param job Job instance on where to obtained the entity instance
   */
  public getEntityIdByJob(job: McsJob): Observable<string> {
    let entityId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this.getJobReferenceId()]);
    if (isNullOrEmpty(entityId)) { return of(null); }
    return of(entityId);
  }

  /**
   * Gets the job reference id
   */
  protected abstract getJobReferenceId(): string;
}
