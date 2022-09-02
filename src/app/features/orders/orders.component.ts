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
  McsAuthenticationIdentity,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2
} from '@app/core';
import {
  McsCompany,
  McsFilterInfo,
  McsOrder,
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
  selector: 'mcs-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersComponent extends McsPageBase {

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public readonly dataSource: McsTableDataSource2<McsOrder>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' })
  ];

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getOrders.bind(this));
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

  public get featureName(): string {
    return 'orders';
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

  private _getOrders(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsOrder>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getOrders(queryParam).pipe(

      map(response => {

        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
