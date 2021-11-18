import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  CrispOrderState,
  McsFilterInfo,
  McsObjectCrispElement,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import { createObject } from '@app/utilities';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CrispOrderService } from '../crisp-order.service';
import { WorkflowSelectorConfig } from '@app/features/launch-pad/workflows/workflow';

@Component({
  selector: 'mcs-crisp-order-elements',
  templateUrl: './crisp-order-elements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrderElementsComponent implements OnDestroy {
  public crispOrder$:  Observable<McsObjectCrispOrder>;;
  public readonly dataSource: McsTableDataSource2<McsObjectCrispElement>;

  public isSorting: boolean;

  public state: CrispOrderState = 'OPEN';
  private _orderId: string;
  private _sortDirection: string;
  private _sortField: string;
  private _destroySubject = new Subject<void>();

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'assignee' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'hostingEngineer' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _crispOrderService: CrispOrderService
  ) {
    this._subscribeToCrispOrderDetails();

    this.dataSource = new McsTableDataSource2<McsObjectCrispElement>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
      this.crispOrder$.subscribe();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  public selectedTabChange(tab: MatTabChangeEvent): void {
    let state: CrispOrderState = tab.index === 0 ? 'OPEN': 'CLOSED';
    if (this.state !== state) {
      this.state = state;
      this.retryDatasource();
    }
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

  public reloadElements(state: CrispOrderState): void {
    this.state = state;
    this.retryDatasource();
  }

  private _subscribeToCrispOrderDetails(): void {
    this.crispOrder$ = this._crispOrderService.getCrispOrderDetails().pipe(
      takeUntil(this._destroySubject),
      tap((crispOrder: McsObjectCrispOrder) => {
        this.retryDatasource();
      }),
      shareReplay(1)
    );
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectCrispElement>> {
    let queryParam = new McsObjectCrispOrderQueryParams();
    queryParam.pageIndex = 1;
    queryParam.pageSize = 100;
    queryParam.state = this.state;
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getCrispOrderElements(this._crispOrderService.getCrispOrderId().toString(), queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      }));
  }
}
