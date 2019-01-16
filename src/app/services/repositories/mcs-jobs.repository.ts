import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  McsNotificationEventsService
} from '@app/core';
import {
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import { McsJob } from '@app/models';
import { McsJobsDataContext } from '../data-context/mcs-jobs-data.context';
import { JobsApiService } from '../api-services/jobs-api.service';

@Injectable()
export class McsJobsRepository extends McsRepositoryBase<McsJob> {

  constructor(
    _jobsApiService: JobsApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(new McsJobsDataContext(_jobsApiService));
    this._subscribeToJobs();
  }

  /**
   * Subscribe to job events to update the existing job based on its status
   */
  private _subscribeToJobs(): void {
    this._notificationEvents.notificationsEvent
      .subscribe((updatedJobs) => {
        if (!isNullOrEmpty(updatedJobs)) {
          updatedJobs.forEach((job) => this.addOrUpdate(job));
        }
        let sortPredicate = (_first: McsJob, _second: McsJob) => {
          return compareDates(_second.createdOn, _first.createdOn);
        };
        this.sortRecords(sortPredicate);
      });
  }
}
