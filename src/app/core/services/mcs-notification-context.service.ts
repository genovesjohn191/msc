import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { CoreDefinition } from '../core.definition';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';
import { McsApiService } from './mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import { McsApiErrorResponse } from '../models/response/mcs-api-error-response';
import {
  getTimeDifference,
  addOrUpdateArrayRecord,
  unsubscribeSafely
} from '../../utilities';

/**
 * MCS notification context service
 * Serves as the main context of the notification and it will
 * get notified when there are changes on the notification job
 */
@Injectable()
export class McsNotificationContextService {

  private _notifications: McsApiJob[];
  private _notificationServiceSubscription: any;
  private _connectionStatusSubscription: any;

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

  /**
   * Subsrcibe to know the connection status in real time
   */
  private _connectionStatusStream: BehaviorSubject<McsConnectionStatus>;
  public get connectionStatusStream(): BehaviorSubject<McsConnectionStatus> {
    return this._connectionStatusStream;
  }
  public set connectionStatusStream(value: BehaviorSubject<McsConnectionStatus>) {
    this._connectionStatusStream = value;
  }

  constructor(
    private _notificationJobService: McsNotificationJobService,
    private _apiService: McsApiService
  ) {
    this._notifications = new Array();
    this._notificationsStream = new BehaviorSubject<McsApiJob[]>(new Array());
    this._connectionStatusStream = new BehaviorSubject<McsConnectionStatus>
      (McsConnectionStatus.Success);

    // Get all previous jobs and filter them those who are In-Progress
    this.getAllActiveJobs();

    // Subscribe to RabbitMQ for real-time update
    this._notificationServiceSubscription = this._notificationJobService.notificationStream
      .subscribe((updatedNotification) => {
        this._updateNotifications(updatedNotification);
      });

    // Subscribe to RabbitMQ connection status to get the error state
    this._connectionStatusSubscription = this._notificationJobService.connectionStatusStream
      .subscribe((status) => {
        this._notifyForConnectionStatus(status);
      });
  }

  /**
   * Destroy all instance of notification job service including its subscription
   */
  public destroy() {
    unsubscribeSafely(this._notificationServiceSubscription);
    unsubscribeSafely(this._connectionStatusSubscription);
  }

  /**
   * Clear non-active notifications including pendings and notify the stream
   */
  public clearNonActiveNotifications() {
    if (this._notifications) {
      // Filter jobs and tasks by Active
      this._notifications = this._notifications.filter((notification) => {
        return notification.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE ||
          notification.status === CoreDefinition.NOTIFICATION_JOB_PENDING;
      });
      this._notificationsStream.next(this._notifications);
    }
  }

  /**
   * Delete notification based on JOB ID
   * @param id Job ID
   */
  public deleteNotificationById(id: string) {
    // Delete notification based on id given
    if (id) {
      this._notifications = this._notifications.filter((notification) => {
        return notification.id !== id;
      });
      this._notificationsStream.next(this._notifications);
    }
  }

  /**
   * TODO: This must be refactored once more filtering option is available on the API.
   * We're looking to add filters for status and dates
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
      .catch((error) => {
        let mcsApiErrorResponse: McsApiErrorResponse;

        if (error instanceof Response) {
          mcsApiErrorResponse = new McsApiErrorResponse();
          mcsApiErrorResponse.message = error.statusText;
          mcsApiErrorResponse.status = error.status;
        } else {
          mcsApiErrorResponse = error;
        }

        return Observable.throw(mcsApiErrorResponse);
      })
      .subscribe((mcsApiResponse) => {
        if (mcsApiResponse.content) {
          this._notifications = mcsApiResponse.content.filter((notification) => {
            let jobIncluded = false;

            // Filtered all the notification based on the status type and time duration
            switch (notification.status) {
              case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
              case CoreDefinition.NOTIFICATION_JOB_PENDING:
                jobIncluded = true;
                break;

              case CoreDefinition.NOTIFICATION_JOB_FAILED:
              case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
              case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
                if (notification.endedOn &&
                  getTimeDifference(notification.endedOn, new Date()) <
                  CoreDefinition.NOTIFICATION_FAILED_TIMEOUT) {
                  jobIncluded = true;
                }
                break;

              case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
              default:
                if (notification.endedOn &&
                  getTimeDifference(notification.endedOn, new Date()) <
                  CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT) {
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

  private _updateNotifications(updatedNotification: McsApiJob) {
    if (updatedNotification && updatedNotification.id) {
      let jobsComparer = (firstRecord: McsApiJob, secondRecord: McsApiJob) => {
        return firstRecord.id === secondRecord.id;
      };

      // Update corresponding notification if it is exist else
      // add it to the list of notifications
      addOrUpdateArrayRecord<McsApiJob>(
        this._notifications, updatedNotification, false, jobsComparer, 0);
      this._notificationsStream.next(this._notifications);
    }
  }

  private _notifyForConnectionStatus(status: any): void {
    this._connectionStatusStream.next(status);
  }
}
