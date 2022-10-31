import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
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

@Component({
  selector: 'mcs-crisp-orders',
  templateUrl: './crisp-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrdersComponent extends McsPageBase implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsObjectCrispOrder>;

  private _state: CrispOrderState = 'OPEN';

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'assignee' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'hostingEngineer' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _identity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get featureName(): string {
    return 'crisp-orders';
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
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getCrispOrders(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      })
    );
  }
}
