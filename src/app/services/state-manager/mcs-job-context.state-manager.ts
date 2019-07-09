import {
  Injectable,
  Injector
} from '@angular/core';
import {
  Subscription,
  Observable,
  of,
  zip
} from 'rxjs';
import {
  take,
  switchMap,
  tap
} from 'rxjs/operators';
import { McsJob } from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  isNullOrEmpty,
  McsDisposable,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { McsJobEntityStrategy } from './job-entities/base/mcs-job-entity.strategy';
import { McsMediaStateManager } from './job-entities/mcs-media.state-manager';
import { McsServerStateManager } from './job-entities/mcs-server.state-manager';
import { McsJobManagerBase } from './job-entities/base/mcs-job-manager.base';

@Injectable()
export class McsJobContextStateManager extends McsJobManagerBase implements McsDisposable {

  private _jobReceivedHandler: Subscription;
  private _entityStrategies: Array<McsJobEntityStrategy<any, any>>;

  constructor(
    _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector
  ) {
    super(_eventDispatcher);
    this._entityStrategies = [];
    this._registerEntityStrategies();
  }

  public dispose(): void {
    unsubscribeSafely(this._jobReceivedHandler);
  }

  /**
   * Event that emits when an inprogress job has been received
   * @param job Job received to be manipulated
   */
  protected onJobInProgress(job: McsJob): void {
    this._updateEntityState(job);
  }

  /**
   * Event that emits when a completed job has been received
   * @param job Job received to be manipulated
   */
  protected onJobCompletion(job: McsJob): void {
    this._updateEntityDetails(job);
  }

  /**
   * Event that emits after a job has been completed
   * @param job Job received to be manipulated
   */
  protected onJobAfterCompletion(job: McsJob): void {
    this._clearEntityState(job);
  }

  /**
   * Event that emits when an error job has been received
   * @param job Job received to be manipulated
   */
  protected onJobError(job: McsJob): void {
    this._clearEntityState(job);
  }

  /**
   * Clears the entity state based on the job
   * @param job Job received that holds the entity key id of the entity
   */
  private _clearEntityState(job: McsJob): void {
    let entityStrategy = this._getEntityStrategy(job);
    if (isNullOrEmpty(entityStrategy)) { return; }

    this._waitUntilDataReceived(entityStrategy, job).pipe(
      switchMap(() => {
        return entityStrategy.getExistingEntityDetails(job).pipe(
          tap((entity) => entityStrategy.clearEntityState(entity, job))
        );
      })
    ).subscribe();
  }

  /**
   * Updates the entity state based on the job
   * @param job Job received that holds the entity key id of the entity
   */
  private _updateEntityState(job: McsJob): void {
    let entityStrategy = this._getEntityStrategy(job);
    if (isNullOrEmpty(entityStrategy)) { return; }

    this._waitUntilDataReceived(entityStrategy, job).pipe(
      switchMap(() => {
        return entityStrategy.getExistingEntityDetails(job).pipe(
          tap((entity) => entityStrategy.updateEntityState(entity, job))
        );
      })
    ).subscribe();
  }

  /**
   * Update the entity details when the job has been done
   * @param job Job to be the basis of the entity
   */
  private _updateEntityDetails(job: McsJob): void {
    let entityStrategy = this._getEntityStrategy(job);
    if (isNullOrEmpty(entityStrategy)) { return; }

    entityStrategy.getUpdatedEntityDetails(job).pipe(
      tap(() => this.dispatchJobAfterCompletion(job))
    ).subscribe();
  }

  /**
   * Waits until the data has been received
   * @param entity Entity strategy to be set
   * @param job Job to be wait
   */
  private _waitUntilDataReceived(entity: McsJobEntityStrategy<any, any>, job: McsJob): Observable<any> {
    let jobManagerRef = of(job);
    let entityManagerRef = zip(entity.dataChange(), jobManagerRef);
    return entityManagerRef.pipe(take(1));
  }

  /**
   * Registers the entity strategies
   */
  private _registerEntityStrategies(): void {
    this._entityStrategies.push(new McsServerStateManager(this._injector));
    this._entityStrategies.push(new McsMediaStateManager(this._injector));
  }

  /**
   * Gets the entity strategy based on job type
   * @param type Type of the job to be obtained
   */
  private _getEntityStrategy(job: McsJob): McsJobEntityStrategy<any, any> {
    let strategyFound = this._entityStrategies.find((entity) =>
      !!getSafeProperty(job, (obj) => obj.clientReferenceObject[entity.getReferenceObjectKey()])
    );
    return strategyFound;
  }
}
