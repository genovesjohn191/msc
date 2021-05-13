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
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsJob,
  McsQueryParam,
  McsTerraformDeploymentActivity,
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
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'tag' })
  ];
  public activity: McsTerraformDeploymentActivity;

  private _destroySubject = new Subject<void>();
  private _createPlanHandler: Subscription;
  private _createApplyHandler: Subscription;
  private _createDestroyHandler: Subscription;

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _deploymentService: AzureDeploymentService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.dataSource = new McsTableDataSource2<McsTerraformDeploymentActivity>()
      .registerConfiguration(new McsMatTableConfig(
        true,
        (target, source) =>
          target.id === source.id ||
          target.id === source.job?.id)
      );
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
    // TODO: Add a query parameter on the url
    // this._navigationService.navigate(RouteKey.LaunchPadAzureDeploymentDetailsHistory,
    // [this.deployment.id], { queryParams: { activityId: activity.id }});

    this.activity = activity;
    this._changeDetector.markForCheck();
  }

  public backToListing(): void {
    this.activity = null;
    this._changeDetector.markForCheck();
  }

  public isFinished(status: TerraformDeploymentStatus): boolean {
    return status === TerraformDeploymentStatus.Failed || status === TerraformDeploymentStatus.Succeeded;
  }

  public getDuration(startDate: Date, endDate: Date): string {
    if (isNullOrEmpty(startDate) || isNullOrEmpty(endDate)) { return ''; }

    let duration: number = getTimeDifference(startDate, endDate);
    return getFriendlyTimespan(duration);
  }

  private _subscribeToDeploymentDetails(): void {
    this._deploymentService.getDeploymentDetails().pipe(
      takeUntil(this._destroySubject),
      tap(deploymentDetails => {
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
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount))
    );
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

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreatePlanEvent);
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreateApplyEvent);
    this._eventDispatcher.dispatch(McsEvent.jobTerraformCreateDestroyEvent);
  }

  private _onCreateActivity(job: McsJob): void {
    let activityIsActive = this._activityIsActiveByJob(job);
    if (!activityIsActive) { return; }

    let jobTerraformActivityRefId = job?.clientReferenceObject?.terraformActivityRefId;
    if (isNullOrEmpty(jobTerraformActivityRefId) || isNullOrEmpty(job.tasks)) { return; }

    if (!job.inProgress) {
      this.dataSource.deleteRecord(item => item.id === job.id);
      this.retryDatasource();
      return;
    }

    let foundRecord = this.dataSource.findRecord(item => item.id === job.id);
    if (isNullOrEmpty(foundRecord)) {
      let newRecord = new McsTerraformDeploymentActivity();
      newRecord.id = job.id;
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