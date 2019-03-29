import {
  zip,
  of
} from 'rxjs';
import {
  take,
  switchMap,
  tap
} from 'rxjs/operators';
import {
  McsDisposable,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsJobManagerBase,
  McsRepository
} from '@app/core';
import {
  McsJob,
  McsEntityBase
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';

export abstract class McsEntityJobManager<T extends McsEntityBase>
  extends McsJobManagerBase implements McsDisposable {

  constructor(
    protected _eventDispatcher: EventBusDispatcherService,
    protected _entityRepository: McsRepository<T>,
    protected _entityKeyId: string
  ) {
    super(_eventDispatcher);
  }

  /**
   * Disposes the server job manager instance
   */
  public dispose(): void {
    super.dispose();
  }

  protected abstract onUpdateEntityState(entity: T, job?: McsJob): void;
  protected abstract onClearEntityState(entity: T): void;

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
   * Update the entity details when the job was done already
   * @param job Job to be the basis of the entity
   */
  private _updateEntityDetails(job: McsJob): void {
    let entityKeyId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this._entityKeyId]);
    if (isNullOrEmpty(entityKeyId)) { return; }

    this._entityRepository.getById(entityKeyId).pipe(
      tap(() => this.dispatchJobAfterCompletion(job))
    ).subscribe();
  }

  /**
   * Update the entity state based on job
   * @param job Job received that holds the entity key id of the entity
   */
  private _updateEntityState(job: McsJob): void {
    let jobManagerRef = of(job);
    let entityManagerRef = zip(
      this._entityRepository.dataChange(),
      jobManagerRef
    );

    entityManagerRef.pipe(
      take(1),
      switchMap(() => {
        let entityKeyId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this._entityKeyId]);
        return this._entityRepository.getBy((entity) => entity.id === entityKeyId);
      })
    ).subscribe((entityDetails) => {
      if (isNullOrEmpty(entityDetails)) { return; }
      this.onUpdateEntityState(entityDetails, job);
    });
  }

  /**
   * Clears the entity state based on the job
   * @param job Job received that holds the entity key id of the entity
   */
  private _clearEntityState(job: McsJob): void {
    let entityKeyId = getSafeProperty(job, (obj) => obj.clientReferenceObject[this._entityKeyId]);
    this._entityRepository.getBy((entity) => entity.id === entityKeyId).subscribe(
      (entityDetails) => {
        if (isNullOrEmpty(entityDetails)) { return; }
        this.onClearEntityState(entityDetails);
      }
    );
  }
}
