import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
  Subscription
} from 'rxjs/Rx';
import { McsNotificationContextService } from './mcs-notification-context.service';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsJobType } from '../enumerations/mcs-job-type.enum';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import {
  compareNumbers,
  compareStrings,
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';

const DEFAULT_CACHE_BUFFER = 25;

@Injectable()
export class McsNotificationEventsService {

  /** Event that emits when create server executed */
  public createServerEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when clone server executed */
  public cloneServerEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when rename server executed */
  public renameServerEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server executed */
  public deleteServerEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when reset server password is executed */
  public resetServerPasswordEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when power state is executed on server  */
  public changeServerPowerStateEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when scale server executed */
  public updateServerComputeEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when attach server media executed */
  public attachServerMediaEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when detach server media executed */
  public detachServerMediaEvent = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server disk executed */
  public createServerDisk = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when update server disk executed */
  public updateServerDisk = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server disk executed */
  public deleteServerDisk = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server network executed */
  public createServerNic = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when update server network executed */
  public updateServerNic = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server network executed */
  public deleteServerNic = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server snapshot executed */
  public createServerSnapshot = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when apply server snapshot executed */
  public applyServerSnapshot = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server snapshot executed */
  public deleteServerSnapshot = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits only when current user triggered a job */
  public currentUserJob = new ReplaySubject<McsApiJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits all jobs */
  public notificationsEvent = new BehaviorSubject<McsApiJob[]>(undefined);

  /** Subscriptions */
  private _notificationsSubscription: Subscription;

  constructor(
    private _notificationsContext: McsNotificationContextService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    this._listenToNotificationsUpdate();
  }

  /**
   * This will notify all the notifications subscribers to get
   * the latest notifications
   */
  public notifyNotificationsSubscribers(): void {
    this._listenToNotificationsUpdate();
  }

  /**
   * Listens to notifications changed stream
   */
  private _listenToNotificationsUpdate(): void {
    unsubscribeSafely(this._notificationsSubscription);
    this._notificationsSubscription = this._notificationsContext.notificationsStream
      .subscribe((updatedNotifications) => {
        // Notify general notifications
        this.notificationsEvent.next(updatedNotifications);

        // Notify Individual Notifications
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
      // Notify the current user for its specific job
      this._notifyUser(notification);

      // Notify job per type
      switch (notification.type) {
        case McsJobType.CreateServer:
          this.createServerEvent.next(notification);
          break;

        case McsJobType.CloneServer:
          this.cloneServerEvent.next(notification);
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

        case McsJobType.UpdateServerCompute:
          this.updateServerComputeEvent.next(notification);
          break;

        case McsJobType.AttachServerMedia:
          this.attachServerMediaEvent.next(notification);
          break;

        case McsJobType.DetachServerMedia:
          this.detachServerMediaEvent.next(notification);
          break;

        case McsJobType.CreateServerDisk:
          this.createServerDisk.next(notification);
          break;

        case McsJobType.UpdateServerDisk:
          this.updateServerDisk.next(notification);
          break;

        case McsJobType.DeleteServerDisk:
          this.deleteServerDisk.next(notification);
          break;

        case McsJobType.CreateServerNic:
          this.createServerNic.next(notification);
          break;

        case McsJobType.UpdateServerNic:
          this.updateServerNic.next(notification);
          break;

        case McsJobType.DeleteServerNic:
          this.deleteServerNic.next(notification);
          break;

        case McsJobType.CreateServerSnapshot:
          this.createServerSnapshot.next(notification);
          break;

        case McsJobType.ApplyServerSnapshot:
          this.applyServerSnapshot.next(notification);
          break;

        case McsJobType.DeleteServerSnapshot:
          this.deleteServerSnapshot.next(notification);
          break;

        default:
          break;
      }
    });
  }

  /**
   * Notify the current user for its specific job
   * @param _job JOB to be notified
   */
  private _notifyUser(_job: McsApiJob): void {
    if (isNullOrEmpty(_job)) { return; }

    let userStartedTheJob = compareStrings(_job.ownerId,
      this._authenticationIdentity.user.userId) === 0;
    if (userStartedTheJob) {
      this.currentUserJob.next(_job);
    }
  }
}
