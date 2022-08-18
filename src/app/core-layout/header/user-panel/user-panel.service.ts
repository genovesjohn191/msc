import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  takeUntil
} from 'rxjs';

import { Injectable } from '@angular/core';
import {
  McsNotificationContextService,
  McsNotificationNoticeService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsJob,
  McsNotice
} from '@app/models';
import {
  addOrUpdateArrayRecord,
  compareDates,
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

@Injectable()
export class UserPanelService implements McsDisposable {
  private _notifications: any = [];
  private _activities: McsJob[] = [];
  private _notices: McsNotice[] = [];
  private _notificationsChange = new BehaviorSubject<any>([]);
  private _noticeSubject = new Subject<void>();
  private _currentUserJobHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _notificationContext: McsNotificationContextService,
    private _notificationNotices: McsNotificationNoticeService,
  ) {
    this._registerEvents();
    this._notificationContext.getAllActiveJobs().subscribe();
    this._notificationNotices.getAllUnacknowledgedNotices();
    this._subscribeToUnacknowledgedNotices();
  }

  public dispose() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  /**
   * An observable event that emits when the notification has been change
   */
  public notificationsChange(): Observable<any> {
    return this._notificationsChange.asObservable();
  }

  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobCurrentUser);
  }

  private _subscribeToUnacknowledgedNotices(): void {
    this._notificationNotices.noticesChange().pipe(
      takeUntil(this._noticeSubject)
    ).subscribe((notices) => {
      this._notices = notices;
      this._updateNoticeItems();
    });
  }

  /**
   * Event that emits when the current user job has been received
   */
  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }

    this._activities = addOrUpdateArrayRecord(
      this._activities,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._sortActivities();
    this._updateActivityItems();
  }

  private _updateActivityItems(): void {
    if (!isNullOrEmpty(this._activities)) {
      this._activities.forEach((activity) => {
        let item = this._notifications?.find((notif) => notif.id === activity.id);
        if (!isNullOrEmpty(item)) { return; } 
        this._notifications.unshift(activity);
      })
    }
    this._notifyNotificationsChanges();
  }

  private _updateNoticeItems(): void {
    if (!isNullOrEmpty(this._notices)) {
      this._notices?.forEach((notice) => {
        let item = this._notifications?.find((notif) => notif.id === notice.id);
        if (!isNullOrEmpty(item)) {
          if (!notice.acknowledged) { return; }
          let noticeIndex = this._notifications?.findIndex((obj => obj.id === notice.id));
          this._notifications[noticeIndex].acknowledged = true;
        } else {
          this._notifications.push(notice);
        }
      })
    }
    this._notifyNotificationsChanges();
  }

  private _sortActivities(): void {
    if (isNullOrEmpty(this._activities)) { return; }

    this._activities.sort((_first: McsJob, _second: McsJob) => {
      return compareDates(_second.createdOn, _first.createdOn);
    });
  }

  private _notifyNotificationsChanges(): void {
    this._notificationsChange.next(this._notifications);
  }
}
