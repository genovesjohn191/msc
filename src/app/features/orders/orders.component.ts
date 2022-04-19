import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
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
  McsNavigationService,
  McsAuthenticationIdentity,
  McsTableDataSource2,
  McsMatTableQueryParam,
  McsMatTableContext,
  McsFilterPanelEvents
} from '@app/core';
import {
  isNullOrEmpty,
  createObject,
  getSafeProperty
} from '@app/utilities';
import {
  RouteKey,
  McsOrder,
  McsQueryParam,
  McsCompany,
  McsFilterInfo
} from '@app/models';
import { McsApiService } from '@app/services';
import { ColumnFilter, Paginator, Search } from '@app/shared';

@Component({
  selector: 'mcs-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersComponent {

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public readonly dataSource: McsTableDataSource2<McsOrder>;
  public readonly filterPanelEvents: McsFilterPanelEvents;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' })
  ];

  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
  ) {
    this.dataSource = new McsTableDataSource2(this._getOrders.bind(this));
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

  /**
   * Whether to show annotation or not
   * @param companyId createdByCompanyId/modifiedByCompanyId of the selected order
   */
  public createdWithDifferentCompany(companyId: string): boolean {
    return companyId && this.activeCompany?.id !== companyId;
  }

  /**
   * Navigate to order details page
   * @param order Order to view the details
   */
  public navigateToOrder(order: McsOrder): void {
    if (isNullOrEmpty(order)) { return; }
    this._navigationService.navigateTo(RouteKey.OrderDetails, [order.id]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getOrders(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsOrder>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getOrders(queryParam).pipe(
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
