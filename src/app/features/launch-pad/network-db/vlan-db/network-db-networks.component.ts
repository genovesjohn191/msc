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
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  McsAzureDeploymentsQueryParams,
  McsFilterInfo,
  McsNetworkDbNetwork
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
  selector: 'mcs-network-db-networks',
  templateUrl: './network-db-networks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworksComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsNetworkDbNetwork>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'useCase' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'multicastIpAddress' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2<McsNetworkDbNetwork>(this._getTableData.bind(this))
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

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbNetwork>> {
    let queryParam = new McsAzureDeploymentsQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getNetworkDbNetworks(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }
}
