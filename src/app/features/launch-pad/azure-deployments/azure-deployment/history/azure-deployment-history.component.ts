import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  JobStatus,
  McsFilterInfo,
  McsJob,
  McsQueryParam,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity,
  RouteKey,
  TerraformDeploymentStatus
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator
} from '@app/shared';
import {
  createObject,
  getFriendlyTimespan,
  getSafeProperty,
  getTimeDifference,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { AzureDeploymentService } from '../azure-deployment.service';
import {
  ActivatedRoute,
  NavigationExtras
} from '@angular/router';
import { JobInfo } from '@app/shared/task-log-stream-viewer/task-log-stream-viewer.component';

@Component({
  selector: 'mcs-azure-deployment-history',
  templateUrl: './azure-deployment-history.component.html',
  styleUrls: ['../../azure-deployments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentActivitiesComponent implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsTerraformDeploymentActivity>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'duration' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'tag' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'updatedBy' })
  ];
  public targetActivityId: string;
  public targetJobId: string;
  public activity: McsTerraformDeploymentActivity;
  public deployment: McsTerraformDeployment;

  private _destroySubject = new Subject<void>();
  private _createPlanHandler: Subscription;
  private _createApplyHandler: Subscription;
  private _createDestroyHandler: Subscription;
  private _createDeleteHandler: Subscription;
  private _jobHandler: Subscription;

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _deploymentService: AzureDeploymentService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.dataSource = new McsTableDataSource2<McsTerraformDeploymentActivity>()
      .registerConfiguration(new McsMatTableConfig(
        true,
        (target, source) =>
          target.id === source.id ||
          target.id === source.job?.clientReferenceObject?.terraformActivityRefId)
      );

    this._subscribeToQueryParams();
  }

  public ngOnInit(): void {
    this._registerEventHandlers();
    this._subscribeToDeploymentDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._createPlanHandler);
    unsubscribeSafely(this._createApplyHandler);
    unsubscribeSafely(this._createDestroyHandler);
    unsubscribeSafely(this._jobHandler);
    this.dataSource.disconnect(null);
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public showActivityDetails(activity: McsTerraformDeploymentActivity): void {
    let extras: NavigationExtras = { queryParams: { activityId: activity.id } };

    if (!isNullOrEmpty(activity.job)) {
      extras = { queryParams: { jobId: activity.job.id } };
    }

    this._navigationService.navigateTo(
      RouteKey.LaunchPadAzureDeploymentDetails,
      [this.deployment.id, 'history'], extras
    );

    this._changeDetector.markForCheck();
  }

  public backToListing(): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadAzureDeploymentDetails,
      [this.deployment.id, 'history'],
    );

    this._resetCurrentActivityView();
  }

  public isFinished(status: TerraformDeploymentStatus): boolean {
    return status === TerraformDeploymentStatus.Failed || status === TerraformDeploymentStatus.Succeeded;
  }

  public getDuration(startDate: Date, endDate: Date): string {
    if (isNullOrEmpty(startDate) || isNullOrEmpty(endDate)) { return ''; }

    let duration: number = getTimeDifference(startDate, endDate);
    return getFriendlyTimespan(duration);
  }

  public getActivityLogTitle(): string {
    let details: string = 'connecting...';
    if (!isNullOrEmpty(this.activity)) {
      details = this.activity.tagName ? this.activity.tagName : this.deployment.tagName;
    }
    return `Deployment Logs (${details})`;
  }

  public getJobInfoOverride(activity: McsTerraformDeploymentActivity): JobInfo {
    let status: JobStatus = JobStatus.Active;
    switch(activity.status) {
      case TerraformDeploymentStatus.Succeeded:
        status = JobStatus.Completed;
        break;

      case TerraformDeploymentStatus.Failed:
        status = JobStatus.Failed;
        break;

      case TerraformDeploymentStatus.New:
      case TerraformDeploymentStatus.Unknown:
        status = JobStatus.Pending;
        break;
    }

    return {
      status,
      endedOn: activity.updatedOn,
      description: `[mcsterra cli] ${activity.type} (${activity.tagName})`
    };
  }

  private _resetCurrentActivityView(): void {
    this.targetJobId = null;
    this.targetActivityId = null;
    this.activity = null;
    this._changeDetector.markForCheck();
  }

  private _subscribeToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject)
    ).subscribe((params)  => {
      this.targetJobId = getSafeProperty(params, (obj) => obj.jobId);
      this.targetActivityId = getSafeProperty(params, (obj) => obj.activityId);
      this.activity = null;
      if (this.targetJobId) {
        this._resolveTargetActivity(this.targetJobId);
      } else if (this.targetActivityId) {
        this._setTargetActivity(this.targetActivityId);
      }

      this._changeDetector.markForCheck();
    });
  }

  private _subscribeToDeploymentDetails(): void {
    this._deploymentService.getDeploymentDetails().pipe(
      takeUntil(this._destroySubject),
      tap(deploymentDetails => {
        this.deployment = deploymentDetails;
        this.dataSource.updateDatasource(query =>
          this._getDeploymentActivities(query, deploymentDetails.id)
        );
      }),
      shareReplay(1)
    ).subscribe();
  }

  private _getDeploymentActivities(
    param: McsMatTableQueryParam,
    deploymentId: string
  ): Observable<McsMatTableContext<McsTerraformDeploymentActivity>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = '';

    return this._apiService.getTerraformDeploymentActivities(deploymentId, queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }

  private _resolveTargetActivity(jobId: string): void {
    if (isNullOrEmpty(jobId)) { return; }

    this._apiService.getJob(jobId).subscribe((response) => {
      let jobIsDone: boolean = response.status >= JobStatus.Completed;
      if (jobIsDone) {
        this._setTargetActivity(response.referenceId);
      } else {
        this._startListeningTargetJobUpdates();
      }
    });
  }

  private _startListeningTargetJobUpdates(): void {
    this._jobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._resolveActivityJobReference.bind(this));
  }

  private _resolveActivityJobReference(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.targetJobId;
    if (!watchedJob || !isNullOrEmpty(this.activity) || isNullOrEmpty(job.referenceId))  { return; }

    this._setTargetActivity(job.referenceId);
  }

  private _setTargetActivity(activityId: string): void {
    if (isNullOrEmpty(activityId)) {
      this._resetCurrentActivityView();
      return;
    }

    this._apiService.getTerraformDeploymentActivity(activityId).subscribe((response) => {
      let validDeploymentContext = response.deployment === this.deployment.id;
      if (!validDeploymentContext) {
        this._resetCurrentActivityView();
        return;
      }

      this.activity = response;
      this._changeDetector.markForCheck();
    });
  }

  private _registerEventHandlers(): void {
    this._createPlanHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobTerraformCreatePlanEvent, this._onCreateActivity.bind(this)
    );

    this._createApplyHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobTerraformCreateApplyEvent, this._onCreateActivity.bind(this)
    );

    this._createDestroyHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobTerraformCreateDestroyEvent, this._onCreateActivity.bind(this)
    );

    this._createDeleteHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobTerraformCreateDeleteEvent, this._onCreateActivity.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreatePlanEvent);
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreateApplyEvent);
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreateDestroyEvent);
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreateDeleteEvent);
  }

  private _onCreateActivity(job: McsJob): void {
    let activityIsActive = this._activityIsActiveByJob(job);
    if (!activityIsActive) { return; }

    let jobTerraformActivityRefId = job?.clientReferenceObject?.terraformActivityRefId;
    if (isNullOrEmpty(jobTerraformActivityRefId) || isNullOrEmpty(job.tasks)) { return; }

    if (!job.inProgress) {
      this.dataSource.deleteRecord(item => item.id === jobTerraformActivityRefId);
      this.retryDatasource();
      return;
    }

    let foundRecord = this.dataSource.findRecord(item => item.id === jobTerraformActivityRefId);
    if (isNullOrEmpty(foundRecord)) {
      let newRecord = new McsTerraformDeploymentActivity();
      newRecord.id = jobTerraformActivityRefId;
      newRecord.type = job?.clientReferenceObject?.type;
      newRecord.isProcessing = job.inProgress;
      newRecord.processingText = job.summaryInformation;
      newRecord.createdOn = job.startedOn;
      newRecord.job = job;
      this.dataSource.insertRecord(newRecord, 0);
    }
  }

  private _activityIsActiveByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this._deploymentService.getDeploymentDetailsId())) { return false; }
    return getSafeProperty(job, (obj) =>
      obj.clientReferenceObject.terraformDeploymentId) === this._deploymentService.getDeploymentDetailsId();
  }
}