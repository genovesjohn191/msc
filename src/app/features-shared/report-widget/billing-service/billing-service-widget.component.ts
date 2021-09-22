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
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {
  McsOption,
  McsReportBillingServiceGroup,
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
export class BillingServiceWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {

  @Input()
  public billingAccountId: string;

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();
  private _billingServiceTooltipMap = new Map<number, BillingServiceItem>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
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

  public ngOnInit() {
    this._subscribeToChartItemsChange();
    this.getBillingSummaries();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingAccountIdChange = changes['billingAccountId'];
    if (!isNullOrEmpty(billingAccountIdChange)) { this.getBillingSummaries(); }
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
    apiQuery.billingAccountId = this.billingAccountId;

    this._apiService.getBillingSummaries(apiQuery).pipe(
      map(billingSummaries => {
        if (isNullOrEmpty(billingSummaries)) { return []; }

        let flatRecords = this._getFlatBillingServices(billingSummaries?.collection);
        return this._convertFlatRecordsToChartItems(flatRecords);
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
    let serviceFound = this._billingServiceTooltipMap.get(opts.seriesIndex);
    if (isNullOrEmpty(serviceFound)) { return null; }

    return this.generateCustomHtmlTooltip(serviceFound?.service, [
      new McsOption(
        serviceFound.finalChargeDollars,
        this._translate.instant('label.total')
      ),
      new McsOption(
        this._getMinimumCommitmentText(serviceFound),
        this._translate.instant('label.minimumSpendCommitment')
      ),
      new McsOption(
        this._translate.instant('message.markupPercent', { markup: serviceFound.managementCharges | 0 }),
        this._translate.instant('label.managementCharges')
      ),
      new McsOption(
        serviceFound.tenantName,
        this._translate.instant('label.tenantName')
      ),
      new McsOption(
        serviceFound.initialDomain,
        this._translate.instant('label.initialDomain')
      ),
      new McsOption(
        serviceFound.primaryDomain,
        this._translate.instant('label.primaryDomain')
      ),
      new McsOption(
        serviceFound.microsoftIdentifier,
        this._translate.instant('label.microsoftIdentifier')
      ),
      new McsOption(
        serviceFound.microsoftChargeMonth,
        this._translate.instant('label.microsoftChargeMonth')
      ),
      new McsOption(
        serviceFound.macquarieBillMonth,
        this._translate.instant('label.macquarieBillMonth')
      )
    ]);
  }

  private _getMinimumCommitmentText(serviceItem: BillingServiceItem): string {
    return serviceItem.hasMetMinimumCommitment ? serviceItem.minimumSpendCommitment :
      this._translate.instant('message.minimumSpendCommitmentNotMet');
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
        name: billingService.service,
        xValue: billingService.microsoftChargeMonth,
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
          parentService.finalChargeDollars,
          parentService.hasMetMinimumCommitment,
          parentService.minimumCommitmentDollars,
          parentService.markupPercent,
          parentService.tenant?.name,
          parentService.tenant?.initialDomain,
          parentService.tenant?.primaryDomain,
          parentService.microsoftId,
          billingGroup.microsoftChargeMonth,
          billingGroup.macquarieBillMonth
        ));

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          billingServiceItems.push(new BillingServiceItem(
            childService.serviceId,
            childService.finalChargeDollars,
            childService.hasMetMinimumCommitment,
            childService.minimumCommitmentDollars,
            childService.markupPercent,
            childService.tenant?.name,
            childService.tenant?.initialDomain,
            childService.tenant?.primaryDomain,
            childService.microsoftId,
            billingGroup.microsoftChargeMonth,
            billingGroup.macquarieBillMonth
          ));
        });
      });
    });

    // Populate billing services series index
    let seriesIndex = 0;
    billingServiceItems?.forEach(billingService => {
      this._billingServiceTooltipMap.set(seriesIndex++, billingService);
    });

    return billingServiceItems;
  }
}
