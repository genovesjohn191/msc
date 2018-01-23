import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsNotificationContextService } from './mcs-notification-context.service';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsJobType } from '../enumerations/mcs-job-type.enum';
import {
  compareNumbers,
  isNullOrEmpty
} from '../../utilities';

@Injectable()
export class McsNotificationEventsService {

  /** Event that emits when create server executed */
  public createServerEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits when clone server executed */
  public cloneServerEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits when rename server executed */
  public renameServerEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits when delete server executed */
  public deleteServerEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits when reset server password is executed */
  public resetServerPasswordEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits when power state is executed on server  */
  public changeServerPowerStateEvent = new BehaviorSubject<McsApiJob>(undefined);

  /** Event that emits all jobs */
  public notificationsEvent = new BehaviorSubject<McsApiJob[]>(undefined);

  constructor(private _notificationsContext: McsNotificationContextService) {
    this._listenToNotificationsChanged();
  }

  /**
   * Listen to notifications changed stream
   */
  private _listenToNotificationsChanged(): void {
    this._notificationsContext.notificationsStream
      .subscribe((updatedNotifications) => {
        this.notificationsEvent.next(updatedNotifications);
        updatedNotifications.sort(
          (_first: McsApiJob, _second: McsApiJob) => {
            return compareNumbers(_first.type, _second.type);
          });
        this._notifyEventListeners(updatedNotifications);
      });
  }

  /**
   * Notify all event subscribers to set their functionalities
   * @param notifications Notification jobs to emit
   */
  private _notifyEventListeners(notifications: McsApiJob[]): void {
    if (isNullOrEmpty(notifications)) { return; }

    notifications.forEach((notification) => {
      switch (notification.type) {
        case McsJobType.CreateServer:
          this.createServerEvent.next(notification);
          break;

        case McsJobType.CloneServer:
          this.createServerEvent.next(notification);
          break;

        case McsJobType.RenameServer:
          this.renameServerEvent.next(notification);
          break;

        case McsJobType.DeleteServer:
          this.deleteServerEvent.next(notification);
          break;

        case McsJobType.ResetServerPassword:
          this.resetServerPasswordEvent.next(notification);
          break;

        case McsJobType.ChangeServerPowerState:
          this.changeServerPowerStateEvent.next(notification);
          break;

        default:
          break;
      }
    });
  }
}
