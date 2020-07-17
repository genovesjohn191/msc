import { Injectable } from '@angular/core';
import { compareDates } from '@app/utilities';
import { McsJob } from '@app/models';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsApiClientFactory,
  McsApiJobsFactory
} from '@app/api-client';
import { McsJobsDataContext } from '../data-context/mcs-jobs-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsJobsRepository extends McsRepositoryBase<McsJob> {

  private _dispatcher: EventBusDispatcherService;

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(new McsJobsDataContext(_apiClientFactory.getService(new McsApiJobsFactory())));

    this._dispatcher = _eventDispatcher;
    this._registerEvents();
  }

  /**
   * Register the job events
   */
  private _registerEvents(): void {
    this._dispatcher.addEventListener(McsEvent.jobReceive, this._onJobReceive.bind(this));
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
