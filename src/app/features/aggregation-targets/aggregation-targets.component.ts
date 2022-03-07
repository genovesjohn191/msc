import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  catchError,
  map
} from 'rxjs/operators';
import {
  Observable,
  throwError
} from 'rxjs';

import {
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents,
  McsMatTableQueryParam,
  McsMatTableContext
} from '@app/core';
import {
  McsBackUpAggregationTarget,
  McsQueryParam,
  RouteKey,
  InviewLevel,
  inviewLevelText,
  McsFilterInfo
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';

@Component({
  selector: 'mcs-aggregation-targets',
  templateUrl: './aggregation-targets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetsComponent {

  public readonly dataSource: McsTableDataSource2<McsBackUpAggregationTarget>;
  public readonly dataEvents: McsTableEvents<McsBackUpAggregationTarget>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'aggregationTarget' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'retentionPeriod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'inviewLevel' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getBackupAggregationTargets(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsBackUpAggregationTarget>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getBackupAggregationTargets(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
