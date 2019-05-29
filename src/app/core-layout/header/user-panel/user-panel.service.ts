import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  Subscription,
  Observable,
  BehaviorSubject
} from 'rxjs';
import {
  CoreEvent,
  McsNotificationContextService
} from '@app/core';
import { McsJob } from '@app/models';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  compareDates,
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';

@Injectable()
export class UserPanelService implements McsDisposable {
  private _notifications: McsJob[] = [];
  private _notificationsChange = new BehaviorSubject<McsJob[]>([]);
  private _currentUserJobHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _notificationContext: McsNotificationContextService
  ) {
    this._registerEvents();
    this._notificationContext.getAllActiveJobs().subscribe();
  }

  public dispose() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  /**
   * An observable event that emits when the notification has been change
   */
  public notificationsChange(): Observable<McsJob[]> {
    return this._notificationsChange.asObservable();
  }

  /**
   * Registers the events
   */
  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));

    this._eventDispatcher.dispatch(CoreEvent.jobCurrentUser);
  }

  /**
   * Event that emits when the current user job has been received
   */
  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }

    this._notifications = addOrUpdateArrayRecord(
      this._notifications,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._sortNotifications();
    this._notifyNotificationsChanges();
  }

  /**
   * Sort the notifications(jobs) in descending order from the date created
   */
  private _sortNotifications(): void {
    if (isNullOrEmpty(this._notifications)) { return; }

    this._notifications.sort((_first: McsJob, _second: McsJob) => {
      return compareDates(_second.createdOn, _first.createdOn);
    });
  }

  /**
   * Notifies the notification changes
   */
  private _notifyNotificationsChanges(): void {
    this._notificationsChange.next(this._notifications);
  }
}
