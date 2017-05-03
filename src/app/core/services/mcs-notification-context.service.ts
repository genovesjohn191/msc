import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsNotification } from '../models/mcs-notification';
import { McsNotificationJobService } from './mcs-notification-job.service';

/**
 * MCS notification context service
 * Serves as the main context of the notification and it will
 * get notified when there are changes on the notification job
 */
@Injectable()
export class McsNotificationContextService {

  private _notifications: McsNotification[];
  private _notificationServiceSubscription: any;

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

  constructor(private _notificationJobService: McsNotificationJobService) {
    this._notifications = new Array();
    this._notificationsStream = new BehaviorSubject<McsNotification[]>(new Array());

    this._notificationServiceSubscription = this._notificationJobService.notificationStream
      .subscribe((updatedNotification) => {
        this._updateNotifications(updatedNotification);
      });
  }

  /**
   * Destroy all instance of notification job service including its subscription
   */
  public destroy() {
    if (this._notificationServiceSubscription) {
      this._notificationServiceSubscription.unsubscribe();
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
      this._notificationsStream.next(this._notifications);
    }
  }
}
