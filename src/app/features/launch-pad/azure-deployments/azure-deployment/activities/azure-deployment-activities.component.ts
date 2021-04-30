import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  map,
  shareReplay,
  take,
  tap
} from 'rxjs/operators';

import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsQueryParam,
  McsRouteInfo,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { AzureDeploymentService } from '../azure-deployment.service';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mcs-azure-deployment-activities',
  templateUrl: './azure-deployment-activities.component.html',
  styleUrls: ['../../azure-deployments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentActivitiesComponent implements OnDestroy {
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

  public get deployment(): McsTerraformDeployment {
    return this._deployment;
  }
  public set deployment(val: McsTerraformDeployment) {
    if (isNullOrEmpty(val)) { return; }
    this._deployment = val;
    this.dataSource = new McsTableDataSource2(this._getDeploymentActivities.bind(this));
  }
  public deployment$: Observable<McsTerraformDeployment>;
  public activity: McsTerraformDeploymentActivity;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'duration' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'tag' })
  ];

  public dataSource: McsTableDataSource2<McsTerraformDeploymentActivity>;

  private _deployment: McsTerraformDeployment;
  private _data: McsTerraformDeploymentActivity[] = [];
  private _activityId$: Observable<string>;

  public constructor(
    private _apiService: McsApiService,
    private _deploymentService: AzureDeploymentService,
    private _changeDetector: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _activatedRoute: ActivatedRoute
  ) {
    this._subscribeToDeploymentDetails();
    this._listenToRouteChange();
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
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

  public getDuration(startDate: Date, endDate: Date): string {
    if (isNullOrEmpty(startDate) || isNullOrEmpty(endDate)) { return ''; }

    let eventStartTime = startDate;
    let eventEndTime = endDate;
    let duration: number = eventEndTime.valueOf() - eventStartTime.valueOf();
    duration = duration * 0.001;
    let durationPrefix: string = 'seconds';
    // TODO: Create a proper converter
    if (duration > 60) {
      durationPrefix = 'minutes';
      duration = duration / 60;
    }
    if (duration > 60) {
      durationPrefix = 'hours';
      duration = (duration / 60);
    }
    return (Math.round((duration + Number.EPSILON) * 100) / 100).toString() + ' seconds';
  }

  private _getDeploymentActivities(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTerraformDeploymentActivity>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = '';

    return this._apiService.getTerraformDeploymentActivities(this.deployment.id, queryParam).pipe(
      map((response) => {
        this._data = this._data.concat(response?.collection);
        return new McsMatTableContext(this._data, response?.totalCollectionCount);
      }));
  }

  private _subscribeToDeploymentDetails(): void {
    this.deployment$ = this._deploymentService.getDeploymentDetails().pipe(
      take(1),
      tap((deploymentDetails) => {
        this.deployment = deploymentDetails;
      }),
      shareReplay(1)
    );
  }

  private _listenToRouteChange(): void {
    this._activatedRoute.queryParams.pipe(
      map((params) => {
        let activityId = getSafeProperty(params, (obj) => obj.activityId);
        // TODO: Do a search and load activity info
      })).subscribe();
  }
}