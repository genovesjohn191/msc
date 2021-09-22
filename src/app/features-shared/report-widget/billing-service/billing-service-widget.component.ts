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
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { McsReportBillingServiceGroup } from '@app/models';
import { McsApiService } from '@app/services';
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingServiceItem } from './billing-service-item';

@Component({
  selector: 'mcs-billing-service-widget',
  templateUrl: './billing-service-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingServiceWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();
  private _billingServiceItemsMap = new Map<string, BillingServiceItem[]>();

  public constructor(
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
        // customFormatter: this._tooltipCustomFormatter
      }
    };

    // TODO(apascual): Remaining items for this
    // 1. Add the hamburger on the widget
    // 2. Update the tooltip settings (CspLicenses, and AzureSoftwareSubscription are not included)
    // 3. Ask Daniel on what are the color to be set in the graph
  }

  public ngOnInit() {
    this._subscribeToChartItemsChange();
    this.getBillingSummaries();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getBillingSummaries(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    this._apiService.getBillingSummaries().pipe(
      map(billingSummaries => {
        if (isNullOrEmpty(billingSummaries)) { return []; }

        let flatRecords = this._getFlatBillingServices(billingSummaries?.collection);
        return this._convertFlatRecordsToChartItems(flatRecords);
      }),
      tap(chartItems => {
        console.log(chartItems);
        console.log(this._billingServiceItemsMap);
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
    console.log(this._billingServiceItemsMap, opts);

    return `
      <div class="chart-list">
        <div class="chart-title">Azure Consumption Services</div>

        <div class="chart-item">
          <span>Total:</span>
          <span>$87,200</span>
        </div>

        <div class="chart-item">
          <span>Microsoft Charge Month:</span>
          <span>Dec, 2020</span>
        </div>

        <div class"chart-item">
          <span>Macquarie Bill Month:</span>
          <span>Feb 2021</span>
        </div>
      </div>
    `;
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _convertFlatRecordsToChartItems(services: BillingServiceItem[]): ChartItem[] {
    if (isNullOrEmpty(services)) { return []; }

    let chartItems = new Array<ChartItem>();
    services.forEach(billingService => {
      if (isNullOrEmpty(billingService)) { return; }

      chartItems.push({
        name: billingService.name,
        xValue: billingService.chargeMonth,
        yValue: billingService.finalChargeDollars
      } as ChartItem);
    });
    return chartItems;
  }

  private _getFlatBillingServices(billingGroups: McsReportBillingServiceGroup[]): BillingServiceItem[] {
    if (isNullOrEmpty(billingGroups)) { return null; }

    let billingServiceItems = new Array<BillingServiceItem>();

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        // Append Parent Service
        billingServiceItems.push(new BillingServiceItem(
          parentService.serviceId,
          billingGroup.microsoftChargeMonth,
          parentService.finalChargeDollars,
          parentService
        ));

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          billingServiceItems.push(new BillingServiceItem(
            childService.serviceId,
            billingGroup.microsoftChargeMonth,
            childService.finalChargeDollars,
            childService
          ));
        });
      });
    });
    return billingServiceItems;
  }
}
