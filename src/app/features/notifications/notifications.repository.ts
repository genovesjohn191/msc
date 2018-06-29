import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsRepositoryBase,
  McsApiJob,
  McsApiSuccessResponse,
  McsNotificationEventsService
} from '../../core';
import {
  isNullOrEmpty,
  compareDates
} from '../../utilities';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsRepository extends McsRepositoryBase<McsApiJob> {

  constructor(
    private _notificationsApiService: NotificationsService,
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
  ): Observable<McsApiSuccessResponse<McsApiJob[]>> {
    return this._notificationsApiService.getNotifications({
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsApiJob>> {
    return this._notificationsApiService.getNotification(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
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
        let sortPredicate = (_first: McsApiJob, _second: McsApiJob) => {
          return compareDates(_second.createdOn, _first.createdOn);
        };
        this.sortRecords(sortPredicate);
      });
  }
}
