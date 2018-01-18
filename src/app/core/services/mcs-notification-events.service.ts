import {
  Injectable,
  EventEmitter
} from '@angular/core';
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
  public createServerEvent = new EventEmitter<McsApiJob>();

  /** Event that emits when clone server executed */
  public cloneServerEvent = new EventEmitter<McsApiJob>();

  /** Event that emits when rename server executed */
  public renameServerEvent = new EventEmitter<McsApiJob>();

  /** Event that emits when delete server executed */
  public deleteServerEvent = new EventEmitter<McsApiJob>();

  /** Event that emits all jobs */
  public notificationsEvent = new EventEmitter<McsApiJob[]>();

  constructor(private _notificationsContext: McsNotificationContextService) {
    this._listenToNotificationsChanged();
  }

  /**
   * Listen to notifications changed stream
   */
  private _listenToNotificationsChanged(): void {
    this._notificationsContext.notificationsStream
      .subscribe((updatedNotifications) => {
        this.notificationsEvent.emit(updatedNotifications);
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
          this.createServerEvent.emit(notification);
          break;

        case McsJobType.CloneServer:
          this.createServerEvent.emit(notification);
          break;

        case McsJobType.RenameServer:
          this.renameServerEvent.emit(notification);
          break;

        case McsJobType.DeleteServer:
          this.deleteServerEvent.emit(notification);
          break;

        default:
          break;
      }
    });
  }
}
