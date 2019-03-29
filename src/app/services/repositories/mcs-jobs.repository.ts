import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  CoreEvent
} from '@app/core';
import { compareDates } from '@app/utilities';
import { McsJob } from '@app/models';
import { McsJobsDataContext } from '../data-context/mcs-jobs-data.context';
import { JobsApiService } from '../api-services/jobs-api.service';
import { EventBusDispatcherService } from '@app/event-bus';

@Injectable()
export class McsJobsRepository extends McsRepositoryBase<McsJob> {

  constructor(
    _jobsApiService: JobsApiService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    super(new McsJobsDataContext(_jobsApiService));
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
