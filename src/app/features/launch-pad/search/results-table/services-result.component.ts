import { Component, ChangeDetectionStrategy, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { McsFilterService, McsMatTableContext, McsMatTableQueryParam, McsTableDataSource2 } from '@app/core';
import { McsFilterInfo, McsObjectInstalledService, McsQueryParam } from '@app/models';
import { McsApiService } from '@app/services';
import { unsubscribeSafely, getSafeProperty, isNullOrEmpty } from '@app/utilities';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkflowSelectorConfig } from '../../core';

@Component({
  selector: 'mcs-launch-pad-search-services-result',
  templateUrl: './services-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchServicesResultComponent implements OnDestroy {
  @Output()
  public filterInfoInitialized = new EventEmitter<McsFilterInfo[]>();

  @Input()
  public set keyword(value: string) {
    if (this._keyword !== value) {
      this._keyword = value;
    }

    this.retryDatasource();
  }

  @Input()
  public set dataFilters(value: McsFilterInfo[]) {
    if (isNullOrEmpty(value)) { return; }

    this.dataSource.registerColumnsFilterInfo(value);
  }

  public readonly dataSource: McsTableDataSource2<McsObjectInstalledService>;
  public _keyword: string = '';

  private _destroySubject = new Subject<void>();

  public constructor(
    private _apiService: McsApiService,
    private _filterService: McsFilterService
  ) {
    this.dataSource = new McsTableDataSource2(this._getData.bind(this));
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _getData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectInstalledService>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = this._keyword;


    return this._apiService.getInstalledServices(queryParam).pipe(
      map((response) => {
        return new McsMatTableContext(response.collection, response.totalCollectionCount);
      })
    );
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getLauncherConfig(record: McsObjectInstalledService):  WorkflowSelectorConfig {
    return {
      label: record.serviceId,
      companyId: record.companyId,
      source: 'installed-services',
      serviceId: record.serviceId,
      type: record.productType
    };
  }
}
