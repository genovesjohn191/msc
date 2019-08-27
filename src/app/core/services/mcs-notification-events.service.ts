import { Injectable } from '@angular/core';
import {
  compareStrings,
  isNullOrEmpty,
  compareDates
} from '@app/utilities';
import {
  McsJob,
  JobType,
  DataStatus
} from '@app/models';
import {
  EventBusDispatcherService,
  EventBusState
} from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { LogClass } from '@peerlancers/ngx-logger';

import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsNotificationContextService } from './mcs-notification-context.service';

@Injectable()
@LogClass()
export class McsNotificationEventsService {

  private _jobTypeEventMap: Map<JobType, EventBusState<McsJob>>;
  private _jobStateEventMap: Map<DataStatus, EventBusState<McsJob>>;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _notificationsContext: McsNotificationContextService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    this._createJobTypeEventMap();
    this._createJobStateEventMap();
    this._subscribeToJobsUpdate();
  }

  /**
   * Listens to notifications changed stream
   */
  private _subscribeToJobsUpdate(): void {
    this._notificationsContext.notificationsStream.subscribe((updatedNotifications) => {
      updatedNotifications.sort((first: McsJob, second: McsJob) => {
        return compareDates(first.startedOn, second.startedOn);
      });
      this._notifyJobEventListeners(updatedNotifications);
    });
  }

  /**
   * Notify all event subscribers to set their functionalities
   * @param notifications Notification jobs to emit
   */
  private _notifyJobEventListeners(notifications: McsJob[]): void {
    if (isNullOrEmpty(notifications)) { return; }

    notifications.forEach((job) => {
      if (isNullOrEmpty(job)) { return; }

      this._dispatchJobReceiveEvent(job);
      this._dispatchJobEventByType(job);
      this._dispatchJobEventByState(job);
      this._dispatchJobEventByUser(job);
    });
  }

  /**
   * Dispatch the job based on the job received
   * @param job Job to be dispatched
   */
  private _dispatchJobReceiveEvent(job: McsJob): void {
    this._eventDispatcher.dispatch(McsEvent.jobReceive, job);
  }

  /**
   * Dispatch the job based on its type
   * @param job Job to be dispatched
   */
  private _dispatchJobEventByType(job: McsJob): void {
    let jobEventType = this._jobTypeEventMap.get(job.type);
    if (!isNullOrEmpty(jobEventType)) {
      this._eventDispatcher.dispatch(jobEventType, job);
    }
  }

  /**
   * Dispatch the job based on its state
   * @param job Job to be dispatched
   */
  private _dispatchJobEventByState(job: McsJob): void {
    let jobEventState = this._jobStateEventMap.get(job.dataStatus);
    if (!isNullOrEmpty(jobEventState)) {
      this._eventDispatcher.dispatch(jobEventState, job);
    }
  }

  /**
   * Dispatch the job based on the current user
   * @param job Job to be dispatched
   */
  private _dispatchJobEventByUser(job: McsJob): void {
    let userStartedTheJob = compareStrings(job.initiatorId,
      this._authenticationIdentity.user.userId) === 0;
    if (userStartedTheJob) {
      this._eventDispatcher.dispatch(McsEvent.jobCurrentUser, job);
    }
  }

  /**
   * Creates map table for job type
   */
  private _createJobTypeEventMap(): void {
    this._jobTypeEventMap = new Map();
    this._jobTypeEventMap.set(JobType.AttachServerMedia, McsEvent.jobServerMediaAttach);
    this._jobTypeEventMap.set(JobType.DetachServerMedia, McsEvent.jobServerMediaDetach);
    this._jobTypeEventMap.set(JobType.UpdateServerCompute, McsEvent.jobServerComputeUpdate);
    this._jobTypeEventMap.set(JobType.CreateServerDisk, McsEvent.jobServerDiskCreate);
    this._jobTypeEventMap.set(JobType.UpdateServerDisk, McsEvent.jobServerDiskUpdate);
    this._jobTypeEventMap.set(JobType.DeleteServerDisk, McsEvent.jobServerDiskDelete);
    this._jobTypeEventMap.set(JobType.CreateServerNic, McsEvent.jobServerNicCreate);
    this._jobTypeEventMap.set(JobType.UpdateServerNic, McsEvent.jobServerNicUpdate);
    this._jobTypeEventMap.set(JobType.DeleteServerNic, McsEvent.jobServerNicDelete);
    this._jobTypeEventMap.set(JobType.CreateServerSnapshot, McsEvent.jobServerSnapshotCreate);
    this._jobTypeEventMap.set(JobType.ApplyServerSnapshot, McsEvent.jobServerSnapshotApply);
    this._jobTypeEventMap.set(JobType.DeleteServerSnapshot, McsEvent.jobServerSnapshotDelete);
    this._jobTypeEventMap.set(JobType.PerformServerOsUpdateAnalysis, McsEvent.jobServerOsUpdateInspect);
    this._jobTypeEventMap.set(JobType.ApplyServerOsUpdates, McsEvent.jobServerOsUpdateApply);
    this._jobTypeEventMap.set(JobType.CreateServer, McsEvent.jobServerCreate);
    this._jobTypeEventMap.set(JobType.CloneServer, McsEvent.jobServerClone);
    this._jobTypeEventMap.set(JobType.RenameServer, McsEvent.jobServerRename);
    this._jobTypeEventMap.set(JobType.DeleteServer, McsEvent.jobServerDelete);
    this._jobTypeEventMap.set(JobType.ChangeServerPowerState, McsEvent.jobServerChangePowerState);
    this._jobTypeEventMap.set(JobType.ResetServerPassword, McsEvent.jobServerResetPassword);
    this._jobTypeEventMap.set(JobType.CreateResourceCatalogItem, McsEvent.jobResourceCatalogItemCreate);
    this._jobTypeEventMap.set(JobType.ScaleManagedServer, McsEvent.jobServerManagedScaleEvent);
    this._jobTypeEventMap.set(JobType.RaiseManagedServerInviewLevel, McsEvent.jobServerManagedRaiseInviewLevelEvent);
  }

  /**
   * Creates map table for job state
   */
  private _createJobStateEventMap(): void {
    this._jobStateEventMap = new Map();
    this._jobStateEventMap.set(DataStatus.InProgress, McsEvent.jobInProgress);
    this._jobStateEventMap.set(DataStatus.Error, McsEvent.jobError);
    this._jobStateEventMap.set(DataStatus.Success, McsEvent.jobSuccessful);
  }
}
