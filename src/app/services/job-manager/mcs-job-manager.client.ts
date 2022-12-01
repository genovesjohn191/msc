import {
  of,
  zip,
  Observable,
  Subscription
} from 'rxjs';
import {
  switchMap,
  take,
  tap
} from 'rxjs/operators';

import {
  Injectable,
  Injector
} from '@angular/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  ActionStatus,
  JobType,
  McsEntityBase,
  McsEntityRequester,
  McsJob
} from '@app/models';
import {
  compareDates,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

import { McsJobsRepository } from '../repositories/mcs-jobs.repository';
import { IMcsJobEntity } from './base/mcs-job-entity.interface';
import { McsJobBackupAggregationTargetManager } from './entities/mcs-job-backup-aggregation-target.manager';
import { McsJobExtenderManager } from './entities/mcs-job-extender.manager';
import { McsJobInternetManager } from './entities/mcs-job-internet.manager';
import { McsJobLicenseManager } from './entities/mcs-job-license.manager';
import { McsJobMediaManager } from './entities/mcs-job-media.manager';
import { McsJobNetworkDbNetworkManager } from './entities/mcs-job-network-db-network.manager';
import { McsJobResourceManager } from './entities/mcs-job-resource.manager';
import { McsJobSaasBackupManager } from './entities/mcs-job-saas-backup.manager';
import { McsJobServerManager } from './entities/mcs-job-server.manager';
import { McsJobTerraformDeploymentManager } from './entities/mcs-job-terraform-deployment.manager';
import { McsJobVCenterBaselineManager } from './entities/mcs-job-vcenter-baseline-deployment.manager';

@Injectable()
export class McsJobManagerClient implements McsDisposable {

  private _jobReceiveHandler: Subscription;
  private _jobActiveHandler: Subscription;
  private _jobSuccessfullHandler: Subscription;
  private _jobErrorHandler: Subscription;

  private _jobEntitiesFactory: Map<JobType, IMcsJobEntity<any>>;
  private _eventMap: Map<ActionStatus, EventBusState<any>>;

  private readonly _eventDispatcher: EventBusDispatcherService;
  private readonly _jobsRepository: McsJobsRepository;

  constructor(private _injector: Injector) {
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._eventDispatcher = _injector.get(EventBusDispatcherService);

    this._createJobEntityMap();
    this._createEventMap();
    this._registerJobEvents();
  }

  /**
   * Disposes all the event handlers and other resources
   */
  public dispose(): void {
    unsubscribeSafely(this._jobReceiveHandler);
    unsubscribeSafely(this._jobActiveHandler);
    unsubscribeSafely(this._jobSuccessfullHandler);
    unsubscribeSafely(this._jobErrorHandler);
  }

  /**
   * Event that emits when a job has been received
   * @param job Job received
   */
  private _onJobReceived(job: McsJob): void {
    this._jobsRepository.addOrUpdate(job);
    let sortPredicate = (firstRecord: McsJob, secondRecord: McsJob) => {
      return compareDates(secondRecord.createdOn, firstRecord.createdOn);
    };
    this._jobsRepository.sortRecords(sortPredicate);
  }

  /**
   * Event that emits when the job is currently in progress
   * @param job Job received
   */
  private _onJobActive(job: McsJob): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(job, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    this._waitUntilDataReceived(entityFactory, job).pipe(
      switchMap(() => entityFactory.getEntityIdByJob(job)),
      tap((entityId) => {
        let entityRequester = new McsEntityRequester();
        entityRequester.id = entityId;
        entityRequester.type = entityFactory.getEntityRequesterType();
        entityRequester.disabled = entityFactory.getActionMethod() === ActionStatus.Delete;
        entityRequester.message = job.summaryInformation;

        this._eventDispatcher.dispatch(McsEvent.entityActiveEvent, entityRequester);
      })
    ).subscribe();
  }

  /**
   * Event that emits when the job is completed
   * @param job Job received
   */
  private _onJobCompletion(job: McsJob): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(job, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    this._waitUntilDataReceived(entityFactory, job).pipe(
      switchMap(() => entityFactory.getEntityIdByJob(job)),
      tap((entityId) => {
        let eventAction = this._eventMap.get(entityFactory.getActionMethod());
        if (isNullOrEmpty(eventAction)) { return; }

        let entityRequester = new McsEntityRequester();
        entityRequester.id = entityId;
        entityRequester.type = entityFactory.getEntityRequesterType();
        entityRequester.disabled = false;

        this._eventDispatcher.dispatch(eventAction, entityRequester);
      })
    ).subscribe();
  }

  /**
   * Event that emits when the job enountered an error
   * @param job Job received
   */
  private _onJobError(job: McsJob): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(job, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    this._waitUntilDataReceived(entityFactory, job).pipe(
      switchMap(() => entityFactory.getEntityIdByJob(job)),
      tap((entityId) => {
        let entityRequester = new McsEntityRequester();
        entityRequester.id = entityId;
        entityRequester.type = entityFactory.getEntityRequesterType();
        entityRequester.disabled = false;
        entityRequester.message = job.summaryInformation;

        this._eventDispatcher.dispatch(McsEvent.entityClearStateEvent, entityRequester);
      })
    ).subscribe();
  }

  /**
   * Wait until the data has been received
   * @param entity Entity strategy to be set
   * @param job Payload of the event
   */
  private _waitUntilDataReceived<T extends McsEntityBase>(jobEntity: IMcsJobEntity<T>, job: McsJob): Observable<any> {
    let jobManagerRef = of(job);
    let entityManagerRef = zip(jobEntity.dataChange(), jobManagerRef);
    return entityManagerRef.pipe(take(1));
  }

  /**
   * Registers all the associated event for jobs
   */
  private _registerJobEvents(): void {
    this._jobReceiveHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobReceived.bind(this));

    this._jobActiveHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobInProgress, this._onJobActive.bind(this));

    this._jobSuccessfullHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobSuccessful, this._onJobCompletion.bind(this));

    this._jobErrorHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobError, this._onJobError.bind(this));
  }

  /**
   * Gets the entity factory based on the job type
   * @param jobtype Jobtype to be obtained from the factory
   */
  private _getEntityFactory<T extends McsEntityBase>(jobtype: JobType): IMcsJobEntity<T> {
    let entityFactoryFound = this._jobEntitiesFactory.get(jobtype);
    if (isNullOrEmpty(entityFactoryFound)) { return; }
    return entityFactoryFound;
  }

  /**
   * Creates the event map for action settings
   */
  private _createEventMap(): void {
    this._eventMap = new Map();
    this._eventMap.set(ActionStatus.Add, McsEvent.entityCreatedEvent);
    this._eventMap.set(ActionStatus.Update, McsEvent.entityUpdatedEvent);
    this._eventMap.set(ActionStatus.Delete, McsEvent.entityDeletedEvent);
  }

  /**
   * Creates job entity map
   */
  private _createJobEntityMap(): void {
    this._jobEntitiesFactory = new Map();

    // Servers
    this._jobEntitiesFactory.set(JobType.SelfManagedServerCreate,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.SelfManagedServerUpdateCompute,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.SelfManagedServerDelete,
      new McsJobServerManager(ActionStatus.Delete, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.SelfManagedServerClone,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.SelfManagedServerRename,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerProvision,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerScale,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerProvisionAntiVirus,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerProvisionHids,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerProvisionServerBackup,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerProvisionVmBackup,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerRaiseInviewLevel,
      new McsJobServerManager(ActionStatus.Update, this._injector, 'serviceId')
    );
    this._jobEntitiesFactory.set(JobType.ServerCreateSnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerApplySnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerDeleteSnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerChangePowerState,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerCreateDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerUpdateDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerDeleteDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerResetPassword,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerCreateNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerUpdateNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerDeleteNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerAttachMedia,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ServerDetachMedia,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerPerformOsUpdateAnalysis,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ManagedServerApplyOsUpdates,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );

    // VDC
    this._jobEntitiesFactory.set(JobType.VdcScaleCompute,
      new McsJobResourceManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.VdcExpandStorage,
      new McsJobResourceManager(ActionStatus.Update, this._injector)
    );

    // BAT
    this._jobEntitiesFactory.set(JobType.ManagedServerProvisionBat,
      new McsJobBackupAggregationTargetManager(ActionStatus.Add, this._injector)
    );

    // Media
    this._jobEntitiesFactory.set(JobType.ResourceCreateCatalogItem,
      new McsJobMediaManager(ActionStatus.Add, this._injector)
    );

    // Microsoft License
    this._jobEntitiesFactory.set(JobType.PublicCloudLicenseChangeCount,
      new McsJobLicenseManager(ActionStatus.Update, this._injector)
    );

    // Internet
    this._jobEntitiesFactory.set(JobType.InternetPortPlanChange,
      new McsJobInternetManager(ActionStatus.Update, this._injector)
    );

    // Saas Backup
    this._jobEntitiesFactory.set(JobType.SaasBackupAttempt,
      new McsJobSaasBackupManager(ActionStatus.Add, this._injector)
    );

    // Extenders
    this._jobEntitiesFactory.set(JobType.PrivateCloudLaunchExtenderChangeSpeed,
      new McsJobExtenderManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.AzureExtendChangeSpeed,
      new McsJobExtenderManager(ActionStatus.Update, this._injector)
    );

    // Terraform Deployments
    this._jobEntitiesFactory.set(JobType.TerraformRunPlan,
      new McsJobTerraformDeploymentManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.TerraformRunApply,
      new McsJobTerraformDeploymentManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.TerraformRunDestroy,
      new McsJobTerraformDeploymentManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.TerraformDeleteDeployment,
      new McsJobTerraformDeploymentManager(ActionStatus.Update, this._injector)
    );

    // Network Db
    this._jobEntitiesFactory.set(JobType.NetworkDbCreateNetwork,
      new McsJobNetworkDbNetworkManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.NetworkDbDeleteNetwork,
      new McsJobNetworkDbNetworkManager(ActionStatus.Delete, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.NetworkDbUpdateNetwork,
      new McsJobNetworkDbNetworkManager(ActionStatus.Update, this._injector)
    );

    // VCenter
    this._jobEntitiesFactory.set(JobType.VCenterBaselineRemediate,
      new McsJobVCenterBaselineManager(ActionStatus.Update, this._injector)
    );
  }
}
