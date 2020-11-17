import { Component, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { McsTableDataSource2, McsMatTableQueryParam, McsMatTableContext } from '@app/core';
import { McsFilterInfo, McsObjectCrispElement, McsQueryParam, ProductType } from '@app/models';
import { McsApiService } from '@app/services';
import { unsubscribeSafely, isNullOrEmpty } from '@app/utilities';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LaunchPadContextSource, WorkflowSelectorConfig } from '../../core';

@Component({
  selector: 'mcs-launch-pad-search-elements-result',
  templateUrl: './elements-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchElementsResultComponent implements OnDestroy {
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

  public readonly dataSource: McsTableDataSource2<McsObjectCrispElement>;

  public _keyword: string = '';

  private _destroySubject = new Subject<void>();

  public constructor(private _apiService: McsApiService) {
    this.dataSource = new McsTableDataSource2(this._getData.bind(this));
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _getData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectCrispElement>> {
    let queryParam = new McsQueryParam();
    // queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    // queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = this._keyword;

    return this._apiService.getCrispElements(queryParam).pipe(
      map((response) => {
        return new McsMatTableContext(response.collection, response.totalCollectionCount);
      })
    );
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getLauncherConfig(record: McsObjectCrispElement):  WorkflowSelectorConfig {
    let productType: any = ProductType[record.productType];

    return {
      label: record.serviceId,
      companyId: record.companyId,
      source: 'crisp-elements',
      serviceId: record.serviceId,
      productId: record.productId,
      type: productType
    };
  }
}
