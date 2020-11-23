import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { CoreRoutes } from '@app/core';
import { cloneDeep, CommonDefinition, currencyFormat, unsubscribeSafely } from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { RouteKey, OperationalSavingsSubItems, McsReportOperationalSavings } from '@app/models';
@Component({
  selector: 'mcs-operational-monthly-savings-widget',
  templateUrl: './operational-monthly-savings-widget.component.html',
  styleUrls: ['./operational-monthly-savings-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class OperationalMonthlySavingsWidgetComponent implements OnInit, OnDestroy {

  public processing: boolean = false;
  public hasError: boolean = false;
  public empty: boolean = false;

  public potentialOperationalSavings: string;
  public operationalSavings: McsReportOperationalSavings[];

  private _destroySubject = new Subject<void>();

  public get savingsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CALCULATOR_CHECK_BLACK;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) { }

  ngOnInit(): void {
    this.getCostRecommendations();
    this.getOperationalMonthlySavings();
  }

  ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public moneyFormat(value: number): string {
    return currencyFormat(value);
  }

  public get azureServiceRequestLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }

  public clone(operationalSavings: McsReportOperationalSavings): OperationalSavingsSubItems[] {
    return cloneDeep(operationalSavings.subItems);
  }

  public retryData(): void {
    this.getCostRecommendations();
    this.getOperationalMonthlySavings();
  }

  public getOperationalMonthlySavings(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getOperationalMonthlySavings()
    .pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Operational Monthly Savings endpoint failed.');
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.empty = response.length === 0 ? true : false;
      this.processing = false;
      this.operationalSavings = response;
      this._changeDetectorRef.markForCheck();
    });
  }

  public getCostRecommendations(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getCostRecommendations()
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
      this.potentialOperationalSavings = this.moneyFormat(response.potentialOperationalSavings);
      this._changeDetectorRef.markForCheck();
    });
  }
}
