import { ChangeDetectorRef, Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { cloneObject, CommonDefinition, currencyFormat, getSafeProperty, unsubscribeSafely } from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreRoutes, McsFilterService, McsMatTableContext, McsMatTableQueryParam, McsTableDataSource2 } from '@app/core';
import { McsQueryParam, McsReportVMRightsizing, RouteKey } from '@app/models';

@Component({
  selector: 'mcs-vm-rightsizing-widget',
  templateUrl: './vm-rightsizing-widget.component.html',
  styleUrls: ['./vm-rightsizing-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class VmRightsizingWidgetComponent implements OnInit, OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsReportVMRightsizing>;

  public empty: boolean = false;
  public hasError: boolean = false;
  public processing: boolean = false;
  public hasMore: boolean = false;

  public potentialRightsizingSavings: string;
  public vmRightSizing: McsReportVMRightsizing[];

  private _destroySubject = new Subject<void>();

  public get savingsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CALCULATOR_CHECK_BLACK;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _filterService: McsFilterService,
    private _reportingService: McsReportingService
  ) {
    this.dataSource = new McsTableDataSource2(this.getVMRightsizing.bind(this));
    this.getVMRightsizingSummary();
  }

  ngOnInit(): void {
    this._initializeDataColumns();
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

  private getVMRightsizing(): Observable<McsMatTableContext<McsReportVMRightsizing>> {
    return this._reportingService.getVMRightsizing().pipe(
      map((response) => {
        let vmRightSizing: McsReportVMRightsizing[] = [];
        vmRightSizing.push(...cloneObject(response));

        let dataSourceContext = new McsMatTableContext(vmRightSizing, vmRightSizing.length);
        return dataSourceContext;
      }),
      catchError(() => {
        return throwError('VM Rightsizing endpoint failed.');
      })
    );
  }

  public getVMRightsizingSummary(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getVMRightsizingSummary()
    .pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Cost Recommendations endpoint failed.');
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.processing = false;
      this.potentialRightsizingSavings = this.moneyFormat(response.recommendationSavings);
      this._changeDetectorRef.markForCheck();
    });
  }

  private _initializeDataColumns(): void {
    let dataColumns = this._filterService.getFilterSettings(
      CommonDefinition.FILTERSELECTOR_VM_RIGHTSIZING_LISTING);
    this.dataSource.registerColumnsFilterInfo(dataColumns);
  }
}
