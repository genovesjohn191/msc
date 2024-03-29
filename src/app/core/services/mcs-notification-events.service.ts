import { Injectable } from '@angular/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DataStatus,
  JobType,
  McsJob
} from '@app/models';
import {
  compareDates,
  compareStrings,
  isNullOrEmpty
} from '@app/utilities';
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
    this._jobTypeEventMap.set(JobType.ServerAttachMedia, McsEvent.jobServerMediaAttach);
    this._jobTypeEventMap.set(JobType.ServerDetachMedia, McsEvent.jobServerMediaDetach);
    this._jobTypeEventMap.set(JobType.SelfManagedServerUpdateCompute, McsEvent.jobServerComputeUpdate);
    this._jobTypeEventMap.set(JobType.ServerCreateDisk, McsEvent.jobServerDiskCreate);
    this._jobTypeEventMap.set(JobType.ServerUpdateDisk, McsEvent.jobServerDiskUpdate);
    this._jobTypeEventMap.set(JobType.ServerDeleteDisk, McsEvent.jobServerDiskDelete);
    this._jobTypeEventMap.set(JobType.ServerCreateNic, McsEvent.jobServerNicCreate);
    this._jobTypeEventMap.set(JobType.ServerUpdateNic, McsEvent.jobServerNicUpdate);
    this._jobTypeEventMap.set(JobType.ServerDeleteNic, McsEvent.jobServerNicDelete);
    this._jobTypeEventMap.set(JobType.ServerCreateSnapshot, McsEvent.jobServerSnapshotCreate);
    this._jobTypeEventMap.set(JobType.ServerApplySnapshot, McsEvent.jobServerSnapshotApply);
    this._jobTypeEventMap.set(JobType.ServerDeleteSnapshot, McsEvent.jobServerSnapshotDelete);
    this._jobTypeEventMap.set(JobType.ManagedServerPerformOsUpdateAnalysis, McsEvent.jobServerOsUpdateInspect);
    this._jobTypeEventMap.set(JobType.ManagedServerApplyOsUpdates, McsEvent.jobServerOsUpdateApply);
    this._jobTypeEventMap.set(JobType.SelfManagedServerCreate, McsEvent.jobServerCreate);
    this._jobTypeEventMap.set(JobType.SelfManagedServerClone, McsEvent.jobServerClone);
    this._jobTypeEventMap.set(JobType.SelfManagedServerRename, McsEvent.jobServerRename);
    this._jobTypeEventMap.set(JobType.SelfManagedServerDelete, McsEvent.jobServerDelete);
    this._jobTypeEventMap.set(JobType.ServerChangePowerState, McsEvent.jobServerChangePowerState);
    this._jobTypeEventMap.set(JobType.ServerResetPassword, McsEvent.jobServerResetPassword);
    this._jobTypeEventMap.set(JobType.ResourceCreateCatalogItem, McsEvent.jobResourceCatalogItemCreate);
    this._jobTypeEventMap.set(JobType.ManagedServerScale, McsEvent.jobServerManagedScaleEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerRaiseInviewLevel, McsEvent.jobServerManagedRaiseInviewLevelEvent);
    this._jobTypeEventMap.set(JobType.VdcScaleCompute, McsEvent.jobVdcScaleEvent);
    this._jobTypeEventMap.set(JobType.VdcExpandStorage, McsEvent.jobVdcStorageExpandEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerProvisionAntiVirus, McsEvent.jobServerAvAddEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerProvisionHids, McsEvent.jobServerHidsAddEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerProvisionServerBackup, McsEvent.jobServerBackupServerAddEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerProvisionVmBackup, McsEvent.jobServerBackupVmAddEvent);
    this._jobTypeEventMap.set(JobType.ManagedServerProvisionBat, McsEvent.jobBackupAggregationTargetAddEvent);
    this._jobTypeEventMap.set(JobType.PublicCloudLicenseChangeCount, McsEvent.jobMsLicenseCountChangeEvent);
    this._jobTypeEventMap.set(JobType.InternetPortPlanChange, McsEvent.jobInternetChangePortPlanEvent);
    this._jobTypeEventMap.set(JobType.TerraformRunApply, McsEvent.jobTerraformCreateApplyEvent);
    this._jobTypeEventMap.set(JobType.TerraformRunDestroy, McsEvent.jobTerraformCreateDestroyEvent);
    this._jobTypeEventMap.set(JobType.TerraformRunPlan, McsEvent.jobTerraformCreatePlanEvent);
    this._jobTypeEventMap.set(JobType.TerraformDeleteDeployment, McsEvent.jobTerraformCreateDeleteEvent);
    this._jobTypeEventMap.set(JobType.NetworkDbCreateNetwork, McsEvent.jobNetworkDbNetworkCreateEvent);
    this._jobTypeEventMap.set(JobType.NetworkDbDeleteNetwork, McsEvent.jobNetworkDbNetworkDeleteEvent);
    this._jobTypeEventMap.set(JobType.PrivateCloudLaunchExtenderChangeSpeed, McsEvent.jobPrivateCloudExtenderSpeedChangeEvent);
    this._jobTypeEventMap.set(JobType.AzureExtendChangeSpeed, McsEvent.jobAzureExtendSpeedChangeEvent);
    this._jobTypeEventMap.set(JobType.VCenterBaselineRemediate, McsEvent.jobVCenterBaselineRemediate);
    this._jobTypeEventMap.set(JobType.SaasBackupAttempt, McsEvent.jobSaasBackupAttempt);
    this._jobTypeEventMap.set(JobType.PublicCloudApplicationRecoveryQuotaChange, McsEvent.jobApplicationRecoveryQuotaChange);
  }

  /**
   * Creates map table for job state
   */
  private _createJobStateEventMap(): void {
    this._jobStateEventMap = new Map();
    this._jobStateEventMap.set(DataStatus.Active, McsEvent.jobInProgress);
    this._jobStateEventMap.set(DataStatus.Error, McsEvent.jobError);
    this._jobStateEventMap.set(DataStatus.Success, McsEvent.jobSuccessful);
  }
}
