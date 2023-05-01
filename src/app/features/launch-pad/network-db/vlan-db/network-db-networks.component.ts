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
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsAzureDeploymentsQueryParams,
  McsFilterInfo,
  McsNetworkDbNetwork,
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
  selector: 'mcs-network-db-networks',
  templateUrl: './network-db-networks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworksComponent extends McsPageBase implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsNetworkDbNetwork>;
  public readonly dataEvents: McsTableEvents<McsNetworkDbNetwork>;
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
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2<McsNetworkDbNetwork>(this._getTableData.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeNetworkDbNetworksEvent,
      entityDeleteEvent: McsEvent.entityDeletedEvent
    });
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
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
    return 'network-db-networks';
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public navigateToNetwork(network: McsNetworkDbNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this._navigationService.navigateTo(RouteKey.LaunchPadNetworkDbNetworks, [network.id]);
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbNetwork>> {
    let queryParam = new McsAzureDeploymentsQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getNetworkDbNetworks(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      }));
  }

  public getRouteUrl(id: any): any[] {
    return [RouteKey.LaunchPadNetworkDbNetworks, id.toString()];
  }

  public onClickNewNetwork() {
    this._navigationService.navigateTo(RouteKey.LaunchPadNetworkDbNetworkCreate);
  }
}
