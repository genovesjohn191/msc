import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';
import {
  catchError,
  map,
  takeUntil
} from 'rxjs/operators';
import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  cloneObject,
  CommonDefinition,
  createObject,
  currencyFormat,
  unsubscribeSafely
} from '@app/utilities';
import {
  CoreRoutes,
  McsMatTableContext,
  McsTableDataSource2,
  McsReportingService
} from '@app/core';
import {
  McsFilterInfo,
  McsQueryParam,
  McsReportVMRightsizing,
  RouteKey
} from '@app/models';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'mcs-vm-rightsizing-widget',
  templateUrl: './vm-rightsizing-widget.component.html',
  styleUrls: ['./vm-rightsizing-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class VmRightsizingWidgetComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsReportVMRightsizing>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public empty: boolean = false;
  public hasError: boolean = false;
  public processing: boolean = false;
  public hasMore: boolean = false;

  public potentialRightsizingSavings: string;
  public vmRightSizing: McsReportVMRightsizing[];

  private _sortDirection: string;
  private _sortField: string;

  private _destroySubject = new Subject<void>();

  public get savingsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CALCULATOR_CHECK_BLACK;
  }

  @Output()
  public dataChange= new EventEmitter<McsReportVMRightsizing[]>(null);

  @Output()
  public vmCostChange= new EventEmitter<string>(null);

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) {
    this.dataSource = new McsTableDataSource2(this.getVMRightsizing.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'vmName' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'size' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'region' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'recommendation' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'projectedComputeCost' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'possibleSavings' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'cpuScore' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'memoryScore' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'diskScore' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'efficiency' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'totalScore' }),
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
    this.getVMRightsizingSummary();
  }

  ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public moneyFormat(value: number): string {
    return currencyFormat(value);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public get azureServiceRequestLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }

  public onSortChange(sortState: Sort) {
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private getVMRightsizing(): Observable<McsMatTableContext<McsReportVMRightsizing>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._reportingService.getVMRightsizing(queryParam).pipe(
      map((response) => {
        let vmRightSizing: McsReportVMRightsizing[] = [];
        vmRightSizing.push(...cloneObject(response));

        let dataSourceContext = new McsMatTableContext(vmRightSizing, vmRightSizing.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }

  public getVMRightsizingSummary(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getVMRightsizingSummary()
    .pipe(
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.processing = false;
      this.potentialRightsizingSavings = this.moneyFormat(response.recommendationSavings);
      this.vmCostChange.emit(this.potentialRightsizingSavings);
      this._changeDetectorRef.markForCheck();
    });
  }
}
