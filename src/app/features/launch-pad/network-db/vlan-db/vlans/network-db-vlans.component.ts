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
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsPageBase,
  McsTableDataSource2
} from '@app/core';
import {
  networkDbVlanStatusText,
  McsAzureDeploymentsQueryParams,
  McsFilterInfo,
  McsNetworkDbVlan,
  NetworkDbVlanStatus,
  RouteKey
} from '@app/models';
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
  selector: 'mcs-network-db-vlans',
  templateUrl: './network-db-vlans.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbVlansComponent extends McsPageBase implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsNetworkDbVlan>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'number' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'isInfrastructure' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'pod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'network' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'networkCompany' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' })
  ];

  public constructor(
    injector: Injector,
  ) {
    super(injector);
    this.dataSource = new McsTableDataSource2<McsNetworkDbVlan>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));
  }

  public get featureName(): string {
    return 'network-db-vlans';
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

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getStatusText(status: NetworkDbVlanStatus): string {
    return networkDbVlanStatusText[status];
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public navigateToVlan(vlan: McsNetworkDbVlan): void {
    this.navigation.navigateTo(RouteKey.LaunchPadNetworkDbVlanDetails, [vlan.id?.toString()]);
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbVlan>> {
    let queryParam = new McsAzureDeploymentsQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this.apiService.getNetworkDbVlans(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      }));
  }
}
