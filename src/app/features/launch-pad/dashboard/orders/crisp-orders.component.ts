import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  CrispOrderState,
  McsFilterInfo,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
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
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'mcs-crisp-orders',
  templateUrl: './crisp-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrdersComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsObjectCrispOrder>;
  public isSorting: boolean;

  private _state: CrispOrderState = 'OPEN';
  private _sortDirection: string;
  private _sortField: string;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'assignee' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'hostingEngineer' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _identity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2<McsObjectCrispOrder>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));

  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public selectedTabChange(tab: MatTabChangeEvent): void {
    let state: CrispOrderState = tab.index === 0 ? 'OPEN': 'CLOSED';
    if (this._state !== state) {
      this._state = state;
      this.retryDatasource();
    }
  }

  public navigateToOrderDetails(crispOrder: McsObjectCrispOrder): void {
    this._navigationService.navigateTo(RouteKey.LaunchPadCrispOrderDetails, [crispOrder.orderId.toString()]);
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectCrispOrder>> {
    let queryParam = new McsObjectCrispOrderQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.state = this._state;
    queryParam.assignee = this._identity.user.userId;
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getCrispOrders(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      })
    );
  }
}
