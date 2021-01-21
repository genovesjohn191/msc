import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  Subject,
  Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  McsObjectInstalledService,
  McsQueryParam,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { WorkflowSelectorConfig } from '../../core';

@Component({
  selector: 'mcs-launch-pad-search-services-result',
  templateUrl: './services-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchServicesResultComponent implements OnDestroy, Search {
  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @Input()
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
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
      map((response) => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getLauncherConfig(record: McsObjectInstalledService):  WorkflowSelectorConfig {
    let productType: any = ProductType[record.productType];

    return {
      label: record.serviceId,
      companyId: record.companyId,
      source: 'installed-services',
      serviceId: record.serviceId,
      productId: record.productId,
      type: productType
    };
  }
}
