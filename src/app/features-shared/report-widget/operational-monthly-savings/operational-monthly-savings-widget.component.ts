import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { CoreRoutes } from '@app/core';
import {
  cloneDeep,
  coerceNumber,
  CommonDefinition,
  currencyFormat,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import {
  RouteKey,
  OperationalSavingsSubItems,
  McsReportOperationalSavings,
  OperationalSavingsItems
} from '@app/models';
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
  public operationalSavings: McsReportOperationalSavings;
  public totalSavings: string;

  private _destroySubject = new Subject<void>();

  public get savingsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CALCULATOR_CHECK_BLACK;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) { }

  ngOnInit(): void {
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

  public get hasPotentialSavings(): boolean {
    return coerceNumber(this.totalSavings) > 0 ? true : false;
  }

  public clone(operationalSavings: OperationalSavingsItems): OperationalSavingsSubItems[] {
    return cloneDeep(operationalSavings.subItems);
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
      this.empty = isNullOrEmpty(response) ? true : false;
      this.totalSavings = response.totalSavings > 0 ? response.totalSavings.toFixed(2) : '0.00';
      this.processing = false;
      this.operationalSavings = response;
      this._changeDetectorRef.markForCheck();
    });
  }
}
