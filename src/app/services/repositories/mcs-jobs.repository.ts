import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  CoreEvent
} from '@app/core';
import { compareDates } from '@app/utilities';
import { McsJob } from '@app/models';
import { McsJobsDataContext } from '../data-context/mcs-jobs-data.context';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsApiClientFactory,
  McsApiJobsFactory
} from '@app/api-client';

@Injectable()
export class McsJobsRepository extends McsRepositoryBase<McsJob> {

  constructor(
    _apiClientFactory: McsApiClientFactory,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    super(new McsJobsDataContext(
      _apiClientFactory.getService(new McsApiJobsFactory())
    ));
    this._registerEvents();
  }

  /**
   * Register the job events
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(CoreEvent.jobReceive, this._onJobReceive.bind(this));
  }

  /**
   * Event that emits when the job has been received
   * @param job Job received
   */
  private _onJobReceive(job: McsJob): void {
    this.addOrUpdate(job);
    let sortPredicate = (firstRecord: McsJob, secondRecord: McsJob) => {
      return compareDates(secondRecord.createdOn, firstRecord.createdOn);
    };
    this.sortRecords(sortPredicate);
  }
}
