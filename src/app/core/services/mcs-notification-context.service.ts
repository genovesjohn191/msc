import { Injectable } from '@angular/core';
import {
  Subject,
  BehaviorSubject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsDataStatus } from '../enumerations/mcs-data-status.enum';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { CoreDefinition } from '../core.definition';
import { McsApiService } from './mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import {
  getTimeDifference,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';

/**
 * MCS notification context service
 * Serves as the main context of the notification and it will
 * get notified when there are changes on the notification job
 */
@Injectable()
export class McsNotificationContextService implements McsInitializer {
  private _destroySubject = new Subject<void>();
  private _notifications: McsApiJob[];

  /**
   * Subscribe to get the updated notifications in real-time
   */
  private _notificationsStream: BehaviorSubject<McsApiJob[]>;
  public get notificationsStream(): BehaviorSubject<McsApiJob[]> {
    return this._notificationsStream;
  }
  public set notificationsStream(value: BehaviorSubject<McsApiJob[]>) {
    this._notificationsStream = value;
  }

  constructor(
    private _notificationJobService: McsNotificationJobService,
    private _apiService: McsApiService
  ) {
    this._notifications = new Array();
    this._notificationsStream = new BehaviorSubject<McsApiJob[]>(new Array());
  }

  /**
   * Initializes the context instance
   */
  public initialize(): void {
    this.getAllActiveJobs();
    this._listenToJobChanged();
  }

  /**
   * Destroy all instance of notification job service including its subscription
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Get all the current active jobs from API including all the completed
   * job that is not yet past on their due dates
   */
  public getAllActiveJobs() {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs';

    return this._apiService.get(mcsApiRequestParameter)
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsApiJob[]>(McsApiJob, response);
        return apiResponse ? apiResponse : new McsApiSuccessResponse<McsApiJob[]>();
      })
      .subscribe((mcsApiResponse) => {
        if (mcsApiResponse.content) {
          this._notifications = mcsApiResponse.content.filter((notification) => {
            let jobIncluded = false;

            // Filtered all the notification based on the status type and time duration
            switch (notification.dataStatus) {
              case McsDataStatus.InProgress:
                jobIncluded = true;
                break;

              case McsDataStatus.Error:
                if (notification.endedOn &&
                  getTimeDifference(notification.endedOn, new Date()) <
                  CoreDefinition.NOTIFICATION_FAILED_TIMEOUT_IN_MS) {
                  jobIncluded = true;
                }
                break;

              case McsDataStatus.Success:
              default:
                if (notification.endedOn &&
                  getTimeDifference(notification.endedOn, new Date()) <
                  CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT_IN_MS) {
                  jobIncluded = true;
                }
                break;
            }
            return jobIncluded;
          });
          this._notificationsStream.next(this._notifications);
        }
      });
  }

  /**
   * Updates all the incoming jobs to notify all the subscribers that
   * there are new job or a job was ended
   * @param updatedNotification Updated notifications (jobs) to update
   */
  private _updateNotifications(updatedNotification: McsApiJob) {
    if (updatedNotification && updatedNotification.id) {
      if (this._isSameJobReceived(updatedNotification)) { return; }

      // Comparer method for the jobs
      let jobsComparer = (_job: McsApiJob) => _job.id === updatedNotification.id;

      // Update corresponding notification if it is exist else
      // add it to the list of notifications
      addOrUpdateArrayRecord<McsApiJob>(
        this._notifications, updatedNotification, false, jobsComparer, 0);
      this._notificationsStream.next(this._notifications);
    }
  }

  /**
   * This will remove all completed jobs after emitting the original one
   */
  private _removeCompletedJobs(): void {
    deleteArrayRecord(this._notifications, (job: McsApiJob) => {
      return job.dataStatus !== McsDataStatus.InProgress;
    });
  }

  /**
   * Returns true when the same job including summary information and status is inputted
   *
   * `@Note:` This is needed in order for the notifications
   * not blinking when the same job is received
   */
  private _isSameJobReceived(updatedJob: McsApiJob): boolean {
    let jobExists = this._notifications.find((_job) => {
      return _job.id === updatedJob.id &&
        _job.dataStatus === updatedJob.dataStatus &&
        _job.summaryInformation === updatedJob.summaryInformation;
    });
    return !isNullOrEmpty(jobExists);
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
