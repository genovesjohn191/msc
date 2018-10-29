import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
  Subscription
} from 'rxjs';
import {
  compareNumbers,
  compareStrings,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsJob,
  JobType
} from '@app/models';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsNotificationContextService } from './mcs-notification-context.service';

const DEFAULT_CACHE_BUFFER = 25;

@Injectable()
export class McsNotificationEventsService {

  /** Event that emits when create server executed */
  public createServerEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when clone server executed */
  public cloneServerEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when rename server executed */
  public renameServerEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server executed */
  public deleteServerEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when reset server password is executed */
  public resetServerPasswordEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when power state is executed on server  */
  public changeServerPowerStateEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when scale server executed */
  public updateServerComputeEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when upload media executed */
  public createResourceCatalogItemEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when attach server media executed */
  public attachServerMediaEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when detach server media executed */
  public detachServerMediaEvent = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server disk executed */
  public createServerDisk = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when update server disk executed */
  public updateServerDisk = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server disk executed */
  public deleteServerDisk = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server network executed */
  public createServerNic = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when update server network executed */
  public updateServerNic = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server network executed */
  public deleteServerNic = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when create server snapshot executed */
  public createServerSnapshot = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when apply server snapshot executed */
  public applyServerSnapshot = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits when delete server snapshot executed */
  public deleteServerSnapshot = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits only when current user triggered a job */
  public currentUserJob = new ReplaySubject<McsJob>(DEFAULT_CACHE_BUFFER);

  /** Event that emits all jobs */
  public notificationsEvent = new BehaviorSubject<McsJob[]>(undefined);

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
          (_first: McsJob, _second: McsJob) => {
            return compareNumbers(_first.type, _second.type);
          });
        this._notifyEventListeners(updatedNotifications);
      });
  }

  /**
   * Notify all event subscribers to set their functionalities
   * @param notifications Notification jobs to emit
   */
  private _notifyEventListeners(notifications: McsJob[]): void {
    if (isNullOrEmpty(notifications)) { return; }

    notifications.forEach((notification) => {
      // Notify the current user for its specific job
      this._notifyUser(notification);

      // Notify job per type
      switch (notification.type) {
        case JobType.CreateServer:
          this.createServerEvent.next(notification);
          break;

        case JobType.CloneServer:
          this.cloneServerEvent.next(notification);
          break;

        case JobType.RenameServer:
          this.renameServerEvent.next(notification);
          break;

        case JobType.DeleteServer:
          this.deleteServerEvent.next(notification);
          break;

        case JobType.ResetServerPassword:
          this.resetServerPasswordEvent.next(notification);
          break;

        case JobType.ChangeServerPowerState:
          this.changeServerPowerStateEvent.next(notification);
          break;

        case JobType.UpdateServerCompute:
          this.updateServerComputeEvent.next(notification);
          break;

        case JobType.CreateResourceCatalogItem:
          this.createResourceCatalogItemEvent.next(notification);
          break;

        case JobType.AttachServerMedia:
          this.attachServerMediaEvent.next(notification);
          break;

        case JobType.DetachServerMedia:
          this.detachServerMediaEvent.next(notification);
          break;

        case JobType.CreateServerDisk:
          this.createServerDisk.next(notification);
          break;

        case JobType.UpdateServerDisk:
          this.updateServerDisk.next(notification);
          break;

        case JobType.DeleteServerDisk:
          this.deleteServerDisk.next(notification);
          break;

        case JobType.CreateServerNic:
          this.createServerNic.next(notification);
          break;

        case JobType.UpdateServerNic:
          this.updateServerNic.next(notification);
          break;

        case JobType.DeleteServerNic:
          this.deleteServerNic.next(notification);
          break;

        case JobType.CreateServerSnapshot:
          this.createServerSnapshot.next(notification);
          break;

        case JobType.ApplyServerSnapshot:
          this.applyServerSnapshot.next(notification);
          break;

        case JobType.DeleteServerSnapshot:
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
  private _notifyUser(_job: McsJob): void {
    if (isNullOrEmpty(_job)) { return; }

    let userStartedTheJob = compareStrings(_job.initiatorId,
      this._authenticationIdentity.user.userId) === 0;
    if (userStartedTheJob) {
      this.currentUserJob.next(_job);
    }
  }
}
