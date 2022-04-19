import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsFilterPanelEvents,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  inviewLevelText,
  InviewLevel,
  McsBackUpAggregationTarget,
  McsFilterInfo,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-aggregation-targets',
  templateUrl: './aggregation-targets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetsComponent {

  public readonly dataSource: McsTableDataSource2<McsBackUpAggregationTarget>;
  public readonly dataEvents: McsTableEvents<McsBackUpAggregationTarget>;
  public readonly filterPanelEvents: McsFilterPanelEvents;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'aggregationTarget' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'retentionPeriod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'inviewLevel' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getBackupAggregationTargets.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeAggregationTargets
    });
    this.filterPanelEvents = new McsFilterPanelEvents(_injector);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public inviewLevelLabel(inview: InviewLevel): string {
    return inviewLevelText[inview];
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to aggregation target details page
   * @param aggregationTarget Aggregation Target to view the details
   */
  public navigateToAggregationTarget(aggregationTarget: McsBackUpAggregationTarget): void {
    if (isNullOrEmpty(aggregationTarget)) { return; }
    this._navigationService.navigateTo(RouteKey.BackupAggregationTargetsDetails, [aggregationTarget.id]);
  }



  private _getBackupAggregationTargets(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsBackUpAggregationTarget>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getBackupAggregationTargets(queryParam).pipe(

      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      })
    );
  }
}
