import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsDisposable,
  compareDates,
  unsubscribeSafely
} from '@app/utilities';
import { McsJob } from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { McsJobsRepository } from '@app/services';
import { IMcsInitializable } from '../interfaces/mcs-initializable.interface';

@Injectable()
export class McsJobStateManager implements IMcsInitializable, McsDisposable {

  private _jobReceiveHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _jobRepository: McsJobsRepository
  ) { }

  /**
   * Initializes the all required variables
   */
  public initialize(): void {
    this._registerEvents();
  }

  /**
   * Disposes the job manager instance
   */
  public dispose(): void {
    unsubscribeSafely(this._jobReceiveHandler);
  }

  /**
   * Registers all the events
   */
  private _registerEvents(): void {
    this._jobReceiveHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobReceived.bind(this));
  }

  /**
   * Event that emits when a job has been received
   * @param job Job to be added or updated
   */
  private _onJobReceived(job: McsJob): void {
    this._jobRepository.addOrUpdate(job);
    let sortPredicate = (firstRecord: McsJob, secondRecord: McsJob) => {
      return compareDates(secondRecord.createdOn, firstRecord.createdOn);
    };
    this._jobRepository.sortRecords(sortPredicate);
  }
}