import {
  throwError,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  McsOption,
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary,
  McsReportBillingSummaryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingSummaryItem } from './billing-summary-item';

@Component({
  selector: 'mcs-billing-summary-widget',
  templateUrl: './billing-summary-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingSummaryWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  @Input()
  public set billingAccountId(accountId: string) {
    this._billingAccountId = accountId;
    this.getBillingSummaries();
  }

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingSummaryItemsMap = new Map<string, BillingSummaryItem[]>();
  private _billingSummaryTooltipMap = new Map<number, BillingSummaryItem>();

  private _billingAccountId: string = undefined;

  public constructor(
    private _translate: TranslateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    super();

    this.chartConfig = {
      type: 'bar',
      stacked: true,
      yaxis: {
        title: 'Your Bill',
        showLabel: true,
        valueFormatter: this._valueYFormatter
      },
      xaxis: {
        title: 'Months'
      },
      tooltip: {
        customFormatter: this._tooltipCustomFormatter.bind(this)
      }
    };

    // TODO(apascual): Remaining items for this
    // 1. Add the hamburger on the widget
    // 2. Update the tooltip settings (CspLicenses, and AzureSoftwareSubscription are not included)
    // 3. Ask Daniel on what are the color to be set in the graph
  }

  public ngOnInit(): void {
    this._subscribeToChartItemsChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getBillingSummaries(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    let apiQuery = new McsReportBillingSummaryParams();
    apiQuery.billingAccountId = this._billingAccountId;

    this._apiService.getBillingSummaries(apiQuery).pipe(
      map(billingSummaries => {
        if (isNullOrEmpty(billingSummaries)) { return []; }

        this._updateBillingSummaryMap(billingSummaries?.collection);
        let chartItems = this._convertBillingSummaryMapToChartItems();
        return chartItems;
      }),
      tap(chartItems => {
        if (chartItems?.length === 0) { this.updateChartUri(''); }

        this._chartItemsChange.next(chartItems);
        this.processing = false;
        this._changeDetectorRef.markForCheck();
      }),
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this.updateChartUri('');
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe();
  }

  private _valueYFormatter(val: number): string {
    return !Number.isInteger(val) ? `${val.toFixed(2)}%` : `${val.toFixed()}%`;
  }

  private _tooltipCustomFormatter(opts?: any): string {
    // TODO(apascual): check out what returns the item
    // Find the associated type and return
    let productTypeFound = this._billingSummaryTooltipMap.get(opts.seriesIndex);
    if (isNullOrEmpty(productTypeFound)) { return null; }

    return this.generateCustomHtmlTooltip(productTypeFound?.productType, [
      new McsOption(productTypeFound?.finalChargeDollars, this._translate.instant('label.total')),
      new McsOption(productTypeFound?.microsoftChargeMonth, this._translate.instant('label.microsoftChargeMonth')),
      new McsOption(productTypeFound?.macquarieBillMonth, this._translate.instant('label.macquarieBillMonth'))
    ]);
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _convertBillingSummaryMapToChartItems(): ChartItem[] {
    if (isNullOrEmpty(this._billingSummaryItemsMap)) { return []; }

    let chartItems = new Array<ChartItem>();
    this._billingSummaryItemsMap.forEach((billingItems, productType) => {
      if (isNullOrEmpty(billingItems)) { return; }

      let totalChargeDollars = billingItems
        ?.map(item => item.finalChargeDollars)
        .reduce((total, next) => total + next, 0);

      chartItems.push({
        name: productType,
        xValue: billingItems[0].microsoftChargeMonth,
        yValue: totalChargeDollars
      } as ChartItem);
    });
    return chartItems;
  }

  private _updateBillingSummaryMap(billingGroups: McsReportBillingServiceGroup[]): void {
    if (isNullOrEmpty(billingGroups)) { return null; }

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        // Append Parent Service
        this._appendBillingSummaryToMap(
          'parentService.productType',
          billingGroup.microsoftChargeMonth,
          billingGroup.macquarieBillMonth,
          parentService
        );

        // Append Child Services Data
        parentService?.childBillingServices?.forEach(childService => {
          this._appendBillingSummaryToMap(
            'childService.productType',
            billingGroup.microsoftChargeMonth,
            billingGroup.macquarieBillMonth,
            childService
          );
        });
      });
    });

    // Populate the tooltip items based on summary items map
    let seriesIndex = 0;
    this._billingSummaryItemsMap.forEach((billingItems, productType) => {

      let totalChargeDollars = billingItems
        ?.map(item => item.finalChargeDollars)
        .reduce((total, next) => total + next, 0);

      this._billingSummaryTooltipMap.set(seriesIndex++, new BillingSummaryItem(
        productType,
        billingItems[0].microsoftChargeMonth,
        billingItems[0].macquarieBillMonth,
        totalChargeDollars,
        billingItems[0]
      ));
    });
  }

  private _appendBillingSummaryToMap(
    productType: string,
    chargeMonth: string,
    billMonth: string,
    data: McsReportBillingService | McsReportBillingServiceSummary
  ): void {
    let serviceFound = this._billingSummaryItemsMap.get(productType);
    let services = serviceFound;

    let finalChargeDollars = data instanceof McsReportBillingService ?
      data.finalChargeDollars : data.finalChargeDollars;

    if (!isNullOrEmpty(serviceFound)) {
      services.push(new BillingSummaryItem(
        productType, chargeMonth, billMonth,
        finalChargeDollars, data
      ));
      return;
    }

    services = new Array<BillingSummaryItem>();
    services.push(new BillingSummaryItem(
      productType, chargeMonth, billMonth,
      finalChargeDollars, data)
    );
    this._billingSummaryItemsMap.set(productType, services);
  }
}
