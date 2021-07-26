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
  McsFilterInfo,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkQueryParams,
  McsNetworkDbVlan,
  NetworkDbVniStatus,
  networkDbVniStatusText
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { ColumnFilter, Paginator } from '@app/shared';

@Component({
  selector: 'mcs-network-db-network-vlans',
  templateUrl: './network-db-network-vlans.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkVlansComponent implements OnDestroy {

  public network$: Observable<McsNetworkDbNetwork>;
  public readonly dataSource: McsTableDataSource2<McsNetworkDbVlan>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'number' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'site' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'pod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
  ];

  public constructor(
    _injector: Injector,
    private _networkDetailService: NetworkDbNetworkDetailsService
    ) {
      this.dataSource = new McsTableDataSource2<McsNetworkDbVlan>(this._getTableData.bind(this))
        .registerConfiguration(new McsMatTableConfig(true))
        .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
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

  public getStatusText(status: NetworkDbVniStatus): string {
    return networkDbVniStatusText[status];
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbVlan>> {
    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);

    return this._networkDetailService.getNetworkVlans().pipe(
      map(response => new McsMatTableContext(response))
    );
  }
}