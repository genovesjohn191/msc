import { Component, ChangeDetectionStrategy, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { McsFilterService, McsMatTableContext, McsMatTableQueryParam, McsTableDataSource2 } from '@app/core';
import { McsFilterInfo, McsObjectInstalledService, McsQueryParam } from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import { unsubscribeSafely, getSafeProperty, isNullOrEmpty } from '@app/utilities';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkflowSelectorConfig } from '../../core';

@Component({
  selector: 'mcs-launch-pad-search-services-result',
  templateUrl: './services-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchServicesResultComponent implements OnDestroy, Search {
  @Input()
  public set dataFilters(value: McsFilterInfo[]) {
    if (isNullOrEmpty(value)) { return; }

    this.dataSource.registerColumnsFilterInfo(value);
  }

  @Input()
  public set keyword(value: string) {
    if (this._keyword !== value) {
      this._keyword = value;
    }

    this.showLoading(true);
    this.searchChangedStream.emit(this);
    this._changeDetector.markForCheck();
  }

  public get keyword(): string {
    return this._keyword;
  }

  public searching: boolean;

  public searchChangedStream: EventEmitter<any> =  new EventEmitter<any>();

  public readonly dataSource: McsTableDataSource2<McsObjectInstalledService>;

  public _keyword: string = '';
  private _destroySubject = new Subject<void>();

  public constructor(private _changeDetector: ChangeDetectorRef, private _apiService: McsApiService) {
    this.dataSource = new McsTableDataSource2(this._getData.bind(this));
    this.dataSource.registerSearch(this);
  }

  public showLoading(showLoading: boolean): void { }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.searchChangedStream);
    unsubscribeSafely(this._destroySubject);
  }

  private _getData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectInstalledService>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

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
