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
} from '@app/event-bus';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsNotificationContextService } from './mcs-notification-context.service';
import { CoreEvent } from '../core.event';

@Injectable()
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
    this._eventDispatcher.dispatch(CoreEvent.jobReceive, job);
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
      this._eventDispatcher.dispatch(CoreEvent.jobCurrentUser, job);
    }
  }

  /**
   * Creates map table for job type
   */
  private _createJobTypeEventMap(): void {
    this._jobTypeEventMap = new Map();
    this._jobTypeEventMap.set(JobType.AttachServerMedia, CoreEvent.jobServerMediaAttach);
    this._jobTypeEventMap.set(JobType.DetachServerMedia, CoreEvent.jobServerMediaDetach);
    this._jobTypeEventMap.set(JobType.UpdateServerCompute, CoreEvent.jobServerComputeUpdate);
    this._jobTypeEventMap.set(JobType.CreateServerDisk, CoreEvent.jobServerDiskCreate);
    this._jobTypeEventMap.set(JobType.UpdateServerDisk, CoreEvent.jobServerDiskUpdate);
    this._jobTypeEventMap.set(JobType.DeleteServerDisk, CoreEvent.jobServerDiskDelete);
    this._jobTypeEventMap.set(JobType.CreateServerNic, CoreEvent.jobServerNicCreate);
    this._jobTypeEventMap.set(JobType.UpdateServerNic, CoreEvent.jobServerNicUpdate);
    this._jobTypeEventMap.set(JobType.DeleteServerNic, CoreEvent.jobServerNicDelete);
    this._jobTypeEventMap.set(JobType.CreateServerSnapshot, CoreEvent.jobServerSnapshotCreate);
    this._jobTypeEventMap.set(JobType.ApplyServerSnapshot, CoreEvent.jobServerSnapshotApply);
    this._jobTypeEventMap.set(JobType.DeleteServerSnapshot, CoreEvent.jobServerSnapshotDelete);
    this._jobTypeEventMap.set(JobType.PerformServerOsUpdateAnalysis, CoreEvent.jobServerOsUpdateInspect);
    this._jobTypeEventMap.set(JobType.ApplyServerOsUpdates, CoreEvent.jobServerOsUpdateApply);
  }

  /**
   * Creates map table for job state
   */
  private _createJobStateEventMap(): void {
    this._jobStateEventMap = new Map();
    this._jobStateEventMap.set(DataStatus.InProgress, CoreEvent.jobInProgress);
    this._jobStateEventMap.set(DataStatus.Error, CoreEvent.jobError);
    this._jobStateEventMap.set(DataStatus.Success, CoreEvent.jobSuccessful);
  }
}
