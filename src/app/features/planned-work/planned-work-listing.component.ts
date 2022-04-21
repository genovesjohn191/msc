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
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsPlannedWork,
  McsPlannedWorkQueryParams,
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
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

@Component({
  selector: 'mcs-planned-work-listing',
  templateUrl: './planned-work-listing.component.html',
  styleUrls: ['./planned-work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedWorkListingComponent extends McsPageBase {
  public readonly dataSource: McsTableDataSource2<McsPlannedWork>;
  private _search: Search;
  public selectedTabIndex: number = 0;
  public isTabChanged: boolean = false;

  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'referenceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'summary' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'plannedStart' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'plannedEnd' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'outageDurationMinutes' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2<McsPlannedWork>(this._getPlannedWorkList.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value) && this._search !== value ) {
      this._search = value;
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

  public get featureName(): string {
    return 'plannedWorkListing';
  }

  public navigateToPlannedWorkDetails(plannedWork: McsPlannedWork) {
    if (isNullOrEmpty(plannedWork)) { return; }
    this._navigationService.navigateTo(RouteKey.PlannedWorkDetails, [plannedWork.id]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public get timeZone(): string {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(isNullOrUndefined(timeZone) || !isNaN(+timeZone)){
      return 'Times displayed are in your local time zone.';
    }
    return 'Time Zone: ' + timeZone;
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'id') {
      return false;
    }
    return true;
  }

  public onTabChanged(): void {
    this.isTabChanged = true;
    this.dataSource.clear();
    this.retryDatasource();
    this._search.clear();
  }

  private _getPlannedWorkList(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsPlannedWork>> {
    let queryParam = new McsPlannedWorkQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    switch(this.selectedTabIndex){
      case 0:
        queryParam.category = 'currentfuture';
        break;
      case 1:
        queryParam.category = 'past';
        break;
    }

    return this._apiService.getPlannedWork(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      })
    );
  }
}
