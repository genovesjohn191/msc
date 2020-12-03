import {
  of,
  BehaviorSubject,
  Observable
} from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  ActionStatus,
  EntityRequester,
  McsEntityBase,
  McsJob
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { McsRepository } from '../../core/mcs-repository.interface';
import { IMcsJobEntity } from './mcs-job-entity.interface';

export abstract class McsJobEntityBase<T extends McsEntityBase> implements IMcsJobEntity<T> {

  private _dataChanged = new BehaviorSubject<T[]>(null);

  constructor(
    protected entityRequester: EntityRequester,
    protected entityRepository: McsRepository<T>,
    protected actionStatus: ActionStatus,
    protected eventBusDispatcher: EventBusDispatcherService
  ) {
    this._subscribeToDataChangeEvent();
  }

  /**
   * Events that emits when the data has been changed
   */
  public dataChange(): Observable<T[]> {
    return this._dataChanged.asObservable().pipe(
      filter((response) => !isNullOrEmpty(response))
    );
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

  private _subscribeToDataChangeEvent(): void {
    let repositoryConfig = this.entityRepository.getConfig();
    if (isNullOrEmpty(repositoryConfig)) { return; }

    this.eventBusDispatcher.addEventListener(
      repositoryConfig.dataChangeEvent,
      (records) => this._dataChanged.next(records)
    );
  }
}
