import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsJob } from '@app/models';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsEvent } from '@app/event-manager';

export abstract class McsJobManagerBase implements McsDisposable {
  private _inProgressJobHandler: Subscription;
  private _successfulJobHandler: Subscription;
  private _errorJobHandler: Subscription;

  constructor(protected _eventDispatcher: EventBusDispatcherService) {
    this._registerJobEvents();
  }

  /**
   * Disposes all the event handlers and other resources
   */
  public dispose(): void {
    unsubscribeSafely(this._inProgressJobHandler);
    unsubscribeSafely(this._successfulJobHandler);
    unsubscribeSafely(this._errorJobHandler);
  }

  /**
   * Dispatch job after completion
   * @param job Job to be dispatched
   */
  public dispatchJobAfterCompletion(job: McsJob): void {
    this.onJobAfterCompletion(job);
  }

  protected abstract onJobInProgress(job: McsJob): void;
  protected abstract onJobCompletion(job: McsJob): void;
  protected abstract onJobAfterCompletion(job: McsJob): void;
  protected abstract onJobError(job: McsJob): void;

  /**
   * Event that emits when the job is currently in progress
   * @param job Job received
   */
  private _onInProgressJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this.onJobInProgress(job);
  }

  /**
   * Event that emits when the job is completed
   * @param job Job received
   */
  private _onCompletedJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this.onJobCompletion(job);
  }

  /**
   * Event that emits when the job enountered an error
   * @param job Job received
   */
  private _onErrorJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this.onJobError(job);
  }

  /**
   * Registers job events
   */
  private _registerJobEvents(): void {
    this._inProgressJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobInProgress, this._onInProgressJob.bind(this));

    this._successfulJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobSuccessful, this._onCompletedJob.bind(this));

    this._errorJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobError, this._onErrorJob.bind(this));
  }
}
