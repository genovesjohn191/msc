import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import {
  of,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';

import {
  CommonDefinition,
  currencyFormat,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsReportCostRecommendations,
  RouteKey
} from '@app/models';
import { CoreRoutes, McsReportingService } from '@app/core';

@Component({
  selector: 'mcs-cost-recommendations-widget',
  templateUrl: './cost-recommendations-widget.component.html',
  styleUrls: ['../report-widget.scss', './cost-recommendations-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class CostRecommendationsWidgetComponent implements OnInit, OnDestroy {
  public get budgetIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOLLAR_BLACK;
  }

  public get savingsIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CALCULATOR_CHECK_BLACK;
  }

  public get cloudHealthUrl(): string  {
    return CommonDefinition.CLOUD_HEALTH_URL;
  }

  @Output()
  public dataChange= new EventEmitter<McsReportCostRecommendations>(null);

  public processing: boolean = false;
  public hasError: boolean = false;
  public costRecommendations: McsReportCostRecommendations;

  private _destroySubject = new Subject<void>();

  public get actual(): number {
    return this.costRecommendations.actual < 0 ? 0 : this.costRecommendations.actual;
  }

  public get budget(): number {
    return this.costRecommendations.budget < 0 ? 0 : this.costRecommendations.budget;
  }

  public get costPercentage(): number {
    if (this.budget === 0) {
      return 0;
    }

    return Math.ceil((this.actual / this.budget) * 100);
  }

  public get costColor(): string {
    let cost = this.costPercentage;
    if (cost > 100) { return 'danger'; }
    else if (cost >= 85) { return 'warn'; }
    return 'good';
  }

  public get potentialOperationalSavings(): string {
    return this.moneyFormat(this.costRecommendations.potentialOperationalSavings)
  }

  public get potentialRightsizingSavings(): string {
    return this.moneyFormat(this.costRecommendations.potentialRightsizingSavings)
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService) { }

  public ngOnInit() {
    this.getCostRecommendations();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public moneyFormat(value: number): string {
    return currencyFormat(value);
  }

  public getCostRecommendations(): void {
    this.processing = true;
    this.hasError = false;
    this.dataChange.emit(undefined);
    this._reportingService.getCostRecommendations()
    .pipe(
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this.dataChange.emit(null);
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.processing = false;
      this.costRecommendations = response;
      this.dataChange.emit(this.costRecommendations);
      this._changeDetectorRef.markForCheck();
    });
  }
}
