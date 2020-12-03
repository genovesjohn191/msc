import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsEvent } from '@app/events';
import {
  DataStatus,
  JobStatus,
  JobType,
  McsJob,
  McsPermission
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { LogClass } from '@peerlancers/ngx-logger';

import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsNotificationJobService } from './mcs-notification-job.service';

/**
 * MCS notification context service
 * Serves as the main context of the notification and it will
 * get notified when there are changes on the notification job
 */
@Injectable()
@LogClass()
export class McsNotificationContextService implements McsDisposable {
  private _destroySubject = new Subject<void>();
  private _excludedJobTypes: JobType[];
  private _notifications: McsJob[];
  private _notificationsStream: BehaviorSubject<McsJob[]>;

  constructor(
    private _accessControlService: McsAccessControlService,
    private _notificationJobService: McsNotificationJobService,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._excludedJobTypes = new Array();
    this._notifications = new Array();
    this._notificationsStream = new BehaviorSubject<McsJob[]>(null);
    this.subscribeToActiveJobs();
    this._registerEvents();
  }

  /**
   * Subscribe to get the updated notifications in real-time
   */
  public get notificationsStream(): Observable<McsJob[]> {
    return this._notificationsStream.pipe(
      filter((response) => response !== null),
      map((jobs) => jobs.filter((job) => {
        let jobType = getSafeProperty(job, (obj) => obj.type);

        return isNullOrEmpty(this._excludedJobTypes
          .find((filteredType) => filteredType === jobType));
      }))
    );
  }

  /**
   * Initializes the context instance
   */
  public subscribeToActiveJobs(): void {
    if (this._accessControlService.hasPermission([McsPermission.JobView])) {
      this.getAllActiveJobs().subscribe();
    }
    this._createFilteredJobList();
    this._listenToJobChanged();
  }

  /**
   * Disposes all instance of the job context from notifying job
   */
  public dispose(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Get all the current active jobs from API including all the completed
   * job that is not yet past on their due dates
   */
  public getAllActiveJobs(): Observable<McsJob[]> {
    return this._apiService.getJobsByStatus(JobStatus.Pending, JobStatus.Active).pipe(
      map((response) => response.collection),
      tap((jobs) => {
        this._notifications = jobs;
        this._notificationsStream.next(this._notifications);
      })
    );
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.dataAllRecordsUpdated,
      this._resendActiveJobs.bind(this)
    );
  }

  private _resendActiveJobs(): void {
    if (isNullOrEmpty(this._notifications)) { return; }
    this._notificationsStream.next(this._notifications);
  }

  /**
   * Updates all the incoming jobs to notify all the subscribers that
   * there are new job or a job was ended
   * @param updatedNotification Updated notifications (jobs) to update
   */
  private _updateNotifications(updatedNotification: McsJob) {
    if (updatedNotification && updatedNotification.id) {
      if (this._isSameJobReceived(updatedNotification)) { return; }

      // Comparer method for the jobs
      let jobsComparer = (_job: McsJob) => _job.id === updatedNotification.id;
      addOrUpdateArrayRecord<McsJob>(
        this._notifications,
        updatedNotification,
        false,
        jobsComparer,
        0
      );
      this._notificationsStream.next(this._notifications);
    }
  }

  /**
   * This will remove all completed jobs after emitting the original one
   */
  private _removeCompletedJobs(): void {
    deleteArrayRecord(this._notifications, (job: McsJob) => {
      return job.dataStatus !== DataStatus.Active;
    });
  }

  /**
   * Returns true when the same job including summary information and status is inputted
   *
   * `@Note:` This is needed in order for the notifications
   * not blinking when the same job is received
   */
  private _isSameJobReceived(updatedJob: McsJob): boolean {
    let jobExists = this._notifications.find((_job) => {
      return _job.id === updatedJob.id &&
        _job.dataStatus === updatedJob.dataStatus &&
        _job.summaryInformation === updatedJob.summaryInformation;
    });
    return !isNullOrEmpty(jobExists);
  }

  /**
   * Creates filtered job
   */
  private _createFilteredJobList(): void {
    this._excludedJobTypes.push(JobType.Undefined);
    this._excludedJobTypes.push(JobType.CatalogRefreshCache);
  }

  /**
   * Listens to every job changed
   */
  private _listenToJobChanged(): void {
    this._destroySubject.next();
    this._notificationJobService.notificationStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((updatedNotification) => {
        this._updateNotifications(updatedNotification);

        // We need to call this function after notifying all the
        // subscribers so that on the next job, all the completed jobs
        // will not be included.
        this._removeCompletedJobs();
      });
  }
}
