import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  CrispOrderState,
  McsFilterInfo,
  McsIdentity,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
  NetworkDbPodType,
  networkDbPodTypeText
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
  private _state: CrispOrderState = 'OPEN';

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
    private _identity: McsAuthenticationIdentity
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

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getTypeText(status: NetworkDbPodType): string {
    return networkDbPodTypeText[status];
  }

  public selectedTabChange(tab: MatTabChangeEvent): void {
    console.log(tab);
    let state: CrispOrderState = tab.index === 0 ? 'OPEN': 'CLOSED';
    if (this._state !== state) {
      this._state = state;
      this.retryDatasource();
    }
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectCrispOrder>> {
    let queryParam = new McsObjectCrispOrderQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.state = this._state;
    queryParam.assignee = 'perskine'; // this._identity.user.userId;

    return this._apiService.getCrispOrders(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }
}
