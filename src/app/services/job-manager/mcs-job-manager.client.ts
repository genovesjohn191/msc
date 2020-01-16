import {
  Injector,
  Injectable
} from '@angular/core';
import {
  Subscription,
  of,
  zip,
  Observable
} from 'rxjs';
import {
  tap,
  take,
  switchMap
} from 'rxjs/operators';
import {
  EventBusState,
  EventBusDispatcherService
} from '@peerlancers/ngx-event-bus';
import {
  McsJob,
  JobType,
  McsEntityBase,
  ActionStatus,
  McsEntityRequester
} from '@app/models';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty,
  compareDates,
  getSafeProperty
} from '@app/utilities';
import { McsEvent } from '@app/events';
import { IMcsJobEntity } from './base/mcs-job-entity.interface';
import { McsJobsRepository } from '../repositories/mcs-jobs.repository';
import { McsJobServerManager } from './entities/mcs-job-server.manager';
import { McsJobMediaManager } from './entities/mcs-job-media.manager';

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

    if (entityFactory.getActionMethod() === ActionStatus.Add) { return; }

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
    this._jobEntitiesFactory.set(JobType.CreateServer,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.UpdateServerCompute,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.DeleteServer,
      new McsJobServerManager(ActionStatus.Delete, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.CloneServer,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.RenameServer,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ProvisionCreateServer,
      new McsJobServerManager(ActionStatus.Add, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ScaleManagedServer,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ScaleVdcCompute,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.RaiseManagedServerInviewLevel,
      new McsJobServerManager(ActionStatus.Update, this._injector, 'serviceId')
    );
    this._jobEntitiesFactory.set(JobType.CreateServerSnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ApplyServerSnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.DeleteServerSnapshot,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ChangeServerPowerState,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.CreateServerDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.UpdateServerDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.DeleteServerDisk,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ResetServerPassword,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.CreateServerNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.UpdateServerNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.DeleteServerNic,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.AttachServerMedia,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.DetachServerMedia,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.PerformServerOsUpdateAnalysis,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );
    this._jobEntitiesFactory.set(JobType.ApplyServerOsUpdates,
      new McsJobServerManager(ActionStatus.Update, this._injector)
    );

    // Media
    this._jobEntitiesFactory.set(JobType.CreateResourceCatalogItem,
      new McsJobMediaManager(ActionStatus.Add, this._injector)
    );
  }
}
