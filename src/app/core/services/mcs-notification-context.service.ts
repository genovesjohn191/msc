import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsNotification } from '../models/mcs-notification';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { CoreDefinition } from '../core.definition';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';

/**
 * MCS notification context service
 * Serves as the main context of the notification and it will
 * get notified when there are changes on the notification job
 */
@Injectable()
export class McsNotificationContextService {

  private _notifications: McsNotification[];
  private _notificationServiceSubscription: any;
  private _connectionStatusSubscription: any;

  /**
   * Subscribe to get the updated notifications in real-time
   */
  private _notificationsStream: BehaviorSubject<McsNotification[]>;
  public get notificationsStream(): BehaviorSubject<McsNotification[]> {
    return this._notificationsStream;
  }
  public set notificationsStream(value: BehaviorSubject<McsNotification[]>) {
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

  constructor(private _notificationJobService: McsNotificationJobService) {
    this._notifications = new Array();
    this._notificationsStream = new BehaviorSubject<McsNotification[]>(new Array());
    this._connectionStatusStream = new BehaviorSubject<McsConnectionStatus>
      (McsConnectionStatus.Success);

    this._notificationServiceSubscription = this._notificationJobService.notificationStream
      .subscribe((updatedNotification) => {
        this._updateNotifications(updatedNotification);
      });

    this._connectionStatusSubscription = this._notificationJobService.connectionStatusStream
      .subscribe((status) => {
        this._notifyForConnectionStatus(status);
      });
  }

  /**
   * Destroy all instance of notification job service including its subscription
   */
  public destroy() {
    if (this._notificationServiceSubscription) {
      this._notificationServiceSubscription.unsubscribe();
    }
    if (this._connectionStatusSubscription) {
      this._connectionStatusSubscription.unsubscribe();
    }
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

  public deleteNotificationById(id: string) {
    // Delete notification based on id given
    if (id) {
      this._notifications = this._notifications.filter((notification) => {
        return notification.id !== id;
      });
      this._notificationsStream.next(this._notifications);
    }
  }

  private _updateNotifications(updatedNotification: McsNotification) {
    if (updatedNotification && updatedNotification.id) {
      let isExist: boolean = false;

      // Update corresponding notification if it is exist else
      // add it to the list of notifications
      for (let index = 0; index < this._notifications.length; ++index) {
        if (this._notifications[index].id.localeCompare(updatedNotification.id) === 0) {
          this._notifications[index] = updatedNotification;
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        this._notifications.push(updatedNotification);
      }

      // Sort notifications by created date in ascending order
      this._notifications.sort((firstRecord, secondRecord) => {
        let isSort = firstRecord.createdOn < secondRecord.createdOn;
        if (isSort) { return 1; }
        return 0;
      });
      this._notificationsStream.next(this._notifications);
    }
  }

  private _notifyForConnectionStatus(status: any): void {
    this._connectionStatusStream.next(status);
  }
}
