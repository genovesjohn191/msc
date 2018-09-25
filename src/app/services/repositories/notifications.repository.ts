import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsRepositoryBase,
  McsNotificationEventsService
} from '@app/core';
import {
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import {
  McsJob,
  McsApiSuccessResponse
} from '@app/models';
import { JobsApiService } from '../api-services/jobs-api.service';

@Injectable()
export class NotificationsRepository extends McsRepositoryBase<McsJob> {

  constructor(
    private _jobApiService: JobsApiService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
    this._listenToNotifications();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data inbound
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsJob[]>> {
    return this._jobApiService.getJobs({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsJob>> {
    return this._jobApiService.getJob(recordId);
  }

  /**
   * Listen to every notifications to get the updated job and reflect it to the list
   */
  private _listenToNotifications(): void {
    this._notificationEvents.notificationsEvent
      .subscribe((updatedNotifications) => {
        // Update all existing notifications based on the notification context
        // and Add the non-exist notifications
        if (!isNullOrEmpty(updatedNotifications)) {
          this.mergeRecords(updatedNotifications);
        }

        // Create sort predicate definition
        let sortPredicate = (_first: McsJob, _second: McsJob) => {
          return compareDates(_second.createdOn, _first.createdOn);
        };
        this.sortRecords(sortPredicate);
      });
  }
}
