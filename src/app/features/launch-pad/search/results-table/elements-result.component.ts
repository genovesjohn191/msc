import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  McsTableDataSource2,
  McsMatTableQueryParam,
  McsMatTableContext,
  McsMatTableConfig
} from '@app/core';
import {
  McsObjectCrispElement,
  McsQueryParam,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search } from '@app/shared';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { WorkflowSelectorConfig } from '../../workflows/workflow';

@Component({
  selector: 'mcs-launch-pad-search-elements-result',
  templateUrl: './elements-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchElementsResultComponent implements OnDestroy, Search {
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
  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

  public searchChangedStream: EventEmitter<any> =  new EventEmitter<any>();

  public readonly dataSource: McsTableDataSource2<McsObjectCrispElement>;

  public _keyword: string = '';

  public constructor(private _changeDetector: ChangeDetectorRef, private _apiService: McsApiService) {
    this.dataSource = new McsTableDataSource2<McsObjectCrispElement>(this._getData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));
    this.dataSource.registerSearch(this);
  }

  public showLoading(showLoading: boolean): void { }

  public clear(): void { }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.searchChangedStream);
    this.dataSource.disconnect(null);
  }

  private _getData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectCrispElement>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getCrispElements(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      }));
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
