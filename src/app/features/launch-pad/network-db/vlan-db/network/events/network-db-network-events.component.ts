import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';

import {
  McsFilterInfo,
  McsNetworkDbNetworkEvent,
  McsNetworkDbNetworkQueryParams
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { ColumnFilter, Paginator } from '@app/shared';

@Component({
  selector: 'mcs-network-db-network-events',
  templateUrl: './network-db-network-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkEventsComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsNetworkDbNetworkEvent>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'user' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'site' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'pod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'vlan' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'date' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _networkDetailService: NetworkDbNetworkDetailsService,
  ) {
    this.dataSource = new McsTableDataSource2<McsNetworkDbNetworkEvent>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
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

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbNetworkEvent>> {
    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);

    let id = this._networkDetailService.getNetworkDetailsId();
    let result = this._apiService.getNetworkDbNetworkEvents(id, queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)))
    return result;
  }
}