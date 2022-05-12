import {
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import { WorkflowSelectorConfig } from '@app/features/launch-pad/workflows/workflow';
import {
  CrispOrderState,
  McsFilterInfo,
  McsObjectCrispElement,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

import { CrispOrderService } from '../crisp-order.service';

@Component({
  selector: 'mcs-crisp-order-elements',
  templateUrl: './crisp-order-elements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrderElementsComponent implements OnDestroy {
  public crispOrder$:  Observable<McsObjectCrispOrder>;;
  public readonly dataSource: McsTableDataSource2<McsObjectCrispElement>;

  public state: CrispOrderState = 'OPEN';
  private _orderId: string;
  private _destroySubject = new Subject<void>();
  private _crispOrderDetails : McsObjectCrispOrder;

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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
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
      companyId: record.companyId ? record.companyId : this._crispOrderDetails.companyId,
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
        this._crispOrderDetails = crispOrder;
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
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getCrispOrderElements(this._crispOrderService.getCrispOrderId().toString(), queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      }));
  }
}
