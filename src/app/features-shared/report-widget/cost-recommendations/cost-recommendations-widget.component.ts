import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition, currencyFormat } from '@app/utilities';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { catchError } from 'rxjs/operators';
import { CoreRoutes } from '@app/core';
import { McsReportCostRecommendations, RouteKey } from '@app/models';

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

export class CostRecommendationsWidgetComponent implements OnInit {
  public processing: boolean = false;
  public hasError: boolean = false;
  public costRecommendations: McsReportCostRecommendations;

  public get actual(): number {
    return this.costRecommendations.actual;
  }

  public get budget(): number {
    return this.costRecommendations.budget;
  }

  public get costPercentage(): number {
    let percentage = (this.actual / this.budget) * 100;
    if (percentage < 0) {
      percentage = 0;
    }

    return Math.round(percentage);
  }

  public get costColor(): string {
    let cost = this.costPercentage;
    if (cost > 100) { return 'over'; }
    else if (cost >= 85) { return 'warning'; }
    return 'good';
  }

  public get potentialOperationalSavings(): string {
    return this.moneyFormat(this.costRecommendations.potentialOperationalSavings)
  }

  public get potentialRightsizingSavings(): string {
    return this.moneyFormat(this.costRecommendations.potentialRightsizingSavings)
  }

  public get azureServiceRequestLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.OrderMsRequestChange);
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService) { }

  public ngOnInit() {
    this.getCostRecommendations();
  }

  public moneyFormat(value: number): string {
    return currencyFormat(value);
  }

  public getCostRecommendations(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getCostRecommendations()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Cost and recommendations endpoint failed.');
    }))
    .subscribe((response) => {
      this.costRecommendations = response;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
