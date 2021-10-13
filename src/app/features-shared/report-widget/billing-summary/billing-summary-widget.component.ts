import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import { DecimalPipe } from '@angular/common';
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
import { McsReportingService } from '@app/core';
import {
  McsOption,
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary
} from '@app/models';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import {
  compareDates,
  getDateOnly,
  getTimestamp,
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingSummaryItem } from './billing-summary-item';

const KEY_SEPARATOR = ':';

class BillingSummaryViewModel {
  constructor(
    public title: string,
    public items: McsOption[],
    public includeProjectionSuffix?: boolean
  ) { }
}

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
export class BillingSummaryWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public billingSummaries: McsReportBillingServiceGroup[];

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingSummaryItemsMap = new Map<string, BillingSummaryItem[]>();
  private _billingSeriesItems: BillingSummaryItem[][] = [];
  private _billingSettingsMap = new Map<string, (item: BillingSummaryItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingSummaryItem) => BillingSummaryViewModel>();

  public constructor(
    private _translate: TranslateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _decimalPipe: DecimalPipe,
    private _datePipe: StdDateFormatPipe,
    private _currencyPipe: StdCurrencyFormatPipe,
    private _reportingService: McsReportingService
  ) {
    super();

    this.chartConfig = {
      type: 'bar',
      stacked: true,
      xaxis: {
        type: 'category'
      },
      yaxis: {
        title: 'Charge',
        showLabel: true,
        valueFormatter: this._valueYFormatter.bind(this)
      },
      tooltip: {
        customFormatter: this._tooltipCustomFormatter.bind(this),
        theme: 'dark'
      },
      dataLabels: {
        enabled: true,
        formatter: this._dataLabelFormatter.bind(this),
        offsetX: -10
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      }
    };

    this._registerSettingsMap();
    this._registerBillingStructMap();
  }

  public ngOnInit(): void {
    this._subscribeToChartItemsChange();
    this.getBillingSummaries();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingSummariesChange = changes['billingSummaries'];
    if (!isNullOrEmpty(billingSummariesChange)) { this.getBillingSummaries(); }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getBillingSummaries(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);

    if (!isNullOrEmpty(this.billingSummaries)) {
      this._billingSummaryItemsMap.clear();
      this._updateBillingSummaryMap(this.billingSummaries);

      let chartItems = this._convertBillingSummaryMapToChartItems();
      this._chartItemsChange.next(chartItems);

      this.processing = isNullOrUndefined(this.billingSummaries);
      if (chartItems?.length === 0) { this.updateChartUri(''); }
    }
    this._changeDetectorRef.markForCheck();
  }

  private _dataLabelFormatter(value: number, opts?: any): string {
    let thousandValue = value / 1000;
    let actualValue = thousandValue > 1 ? thousandValue : value;
    let roundedValue = +this._decimalPipe.transform(actualValue, '1.0-0');

    let displayedValue = thousandValue > 1 ? `$${roundedValue}K` : `$${roundedValue}`;
    return displayedValue;
  }

  private _valueYFormatter(value: number): string {
    return this._currencyPipe.transform(value);
  }

  private _tooltipCustomFormatter(opts?: any): string {
    let billingFound = this._billingSeriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(billingFound)) { return null; }

    let billingViewModel = this._getBillingViewModelByItem(billingFound);
    let billingTitle = this._generateBillingTitle(billingViewModel);

    return this.generateCustomHtmlTooltip(
      billingTitle,
      billingViewModel.items
    );
  }

  private _generateBillingTitle(billingViewModel: BillingSummaryViewModel): string {
    return billingViewModel?.includeProjectionSuffix ?
      `${billingViewModel.title} (Projected)` : billingViewModel?.title;
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _convertBillingSummaryMapToChartItems(): ChartItem[] {
    if (isNullOrEmpty(this._billingSummaryItemsMap)) { return []; }

    // Convert to flat records
    let billingSummaries = new Array<BillingSummaryItem>();
    this._billingSummaryItemsMap.forEach((billingItems, productTypeKey) => {
      if (isNullOrEmpty(billingItems)) { return; }

      let totalChargeDollars = billingItems
        ?.map(item => item.finalChargeDollars)
        .reduce((total, next) => total + next, 0);

      let productType = productTypeKey.split(KEY_SEPARATOR)[0];
      let actualDate = productTypeKey.split(KEY_SEPARATOR)[1];

      billingSummaries.push(new BillingSummaryItem(
        productType,
        billingItems[0].isProjection,
        billingItems[0].microsoftChargeMonth,
        billingItems[0].macquarieBillMonth,
        totalChargeDollars,
        billingItems[0].usdPerUnit,
        getDateOnly(new Date(+actualDate)),
        +actualDate
      ));
    });
    billingSummaries?.sort((first, second) =>
      compareDates(first.sortDate, second.sortDate)
    );

    // Convert to chart items
    let chartItems = new Array<ChartItem>();
    billingSummaries?.forEach(billingSummary => {
      let billingViewModel = this._getBillingViewModelByItem(billingSummary);
      let billingTitle = this._generateBillingTitle(billingViewModel);

      chartItems.push({
        name: billingTitle,
        xValue: billingSummary.microsoftChargeMonth,
        yValue: billingSummary.finalChargeDollars
      } as ChartItem);
    });
    let newChartItems = this._reportingService.fillMissingChartItems(chartItems);

    // Populate billing services series index
    this._updateBillingSeriesItems(newChartItems, billingSummaries);
    return newChartItems;
  }

  private _getBillingViewModelByItem(summary: BillingSummaryItem): BillingSummaryViewModel {
    let billingKey = removeSpaces(summary.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(summary);
  }

  private _updateBillingSeriesItems(chartItems: ChartItem[], summaries: BillingSummaryItem[]): void {
    // Group them first by their service names
    let billingSeriesMap = new Map<string, ChartItem[]>();
    chartItems?.forEach(chartItem => {
      let chartItemsFound = billingSeriesMap.get(chartItem.name);
      if (!isNullOrEmpty(chartItemsFound)) {
        chartItemsFound.push(chartItem);
        return;
      }

      let chartItemsMap = new Array<ChartItem>();
      chartItemsMap.push(chartItem);
      billingSeriesMap.set(chartItem.name, chartItemsMap);
    });

    // Update the indexing on the tooltip
    this._billingSeriesItems = [];
    let seriesIndex = 0;
    billingSeriesMap.forEach((items, key) => {
      this._billingSeriesItems[seriesIndex] = [];

      items.forEach((item, pointIndex) => {
        let serviceFound = summaries.find(summary => {
          let billingViewModel = this._getBillingViewModelByItem(summary);
          let billingTitle = this._generateBillingTitle(billingViewModel);
          return billingTitle === item.name &&
            summary.microsoftChargeMonth === item.xValue;
        });
        this._billingSeriesItems[seriesIndex][pointIndex] = serviceFound;
      });
      seriesIndex++;
    });
  }

  private _updateBillingSummaryMap(billingGroups: McsReportBillingServiceGroup[]): void {
    if (isNullOrEmpty(billingGroups)) { return null; }

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        // Append Parent Service
        this._appendBillingSummaryToMap(
          this._generateItemKey(parentService.productType, getDateOnly(billingGroup.microsoftChargeMonth)),
          billingGroup.isProjection,
          billingGroup.microsoftChargeMonth,
          billingGroup.macquarieBillMonth,
          billingGroup.usdPerUnit,
          parentService
        );

        // Append Child Services Data
        parentService?.childBillingServices?.forEach(childService => {
          this._appendBillingSummaryToMap(
            this._generateItemKey(childService.productType, getDateOnly(billingGroup.microsoftChargeMonth)),
            billingGroup.isProjection,
            billingGroup.microsoftChargeMonth,
            billingGroup.macquarieBillMonth,
            billingGroup.usdPerUnit,
            childService
          );
        });
      });
    });
  }

  private _appendBillingSummaryToMap(
    productTypeKey: string,
    isProjection: boolean,
    chargeMonth: string,
    billMonth: string,
    usdPerUnit: number,
    data: McsReportBillingService | McsReportBillingServiceSummary
  ): void {
    let serviceFound = this._billingSummaryItemsMap.get(productTypeKey);
    let services = serviceFound;

    let finalChargeDollars = data instanceof McsReportBillingService ?
      data.finalChargeDollars : data.finalChargeDollars;

    if (!isNullOrEmpty(serviceFound)) {
      services.push(new BillingSummaryItem(
        productTypeKey,
        isProjection,
        this._datePipe.transform(getDateOnly(chargeMonth), 'shortMonthYear'),
        this._datePipe.transform(getDateOnly(billMonth), 'shortMonthYear'),
        finalChargeDollars,
        usdPerUnit,
        getDateOnly(chargeMonth),
        getTimestamp(chargeMonth)
      ));
      return;
    }

    services = new Array<BillingSummaryItem>();
    services.push(new BillingSummaryItem(
      productTypeKey,
      isProjection,
      this._datePipe.transform(getDateOnly(chargeMonth), 'shortMonthYear'),
      this._datePipe.transform(getDateOnly(billMonth), 'shortMonthYear'),
      finalChargeDollars,
      usdPerUnit,
      getDateOnly(chargeMonth),
      getTimestamp(chargeMonth)
    ));
    this._billingSummaryItemsMap.set(productTypeKey, services);
  }

  private _generateItemKey(type: string, date: Date): string {
    return `${type}${KEY_SEPARATOR}${getTimestamp(date)}`;
  }

  private _isDateGreaterThanExpiry(timestamp: number): boolean {
    let novemberDate = new Date();
    novemberDate.setFullYear(2021, 10, 1);
    return compareDates(new Date(timestamp), novemberDate) !== -1;
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this._currencyPipe.transform(item.finalChargeDollars),
        this._translate.instant('label.total')
      )
    );

    this._billingSettingsMap.set('usdPerUnit', item => {
      let usdPerUnitValue = null;
      if (this._isDateGreaterThanExpiry(item.timestamp)) {
        if (isNullOrUndefined(item.usdPerUnit)) {
          usdPerUnitValue = this._translate.instant('message.notYetAvailable');
        } else {
          usdPerUnitValue = item.usdPerUnit;
        }
      }

      return new McsOption(
        usdPerUnitValue,
        this._translate.instant('label.audUsdExchangeRate')
      )
    });

    this._billingSettingsMap.set('microsoftChargeMonth', item =>
      new McsOption(
        item?.microsoftChargeMonth,
        this._translate.instant('label.microsoftChargeMonth')
      )
    );

    this._billingSettingsMap.set('macquarieBillMonth', item =>
      new McsOption(
        item?.macquarieBillMonth,
        this._translate.instant('label.macquarieBillMonth')
      )
    );
  }

  private _getTooltipOptionsInfo(item: BillingSummaryItem, ...propertyNames: string[]): McsOption[] {
    let tooltipOptions = new Array<McsOption>();

    propertyNames?.forEach(propertyName => {
      let propertyFound = this._billingSettingsMap.get(propertyName);
      if (isNullOrEmpty(propertyFound)) { return; }
      tooltipOptions.push(propertyFound(item));
    });
    return tooltipOptions;
  }

  private _registerBillingStructMap(): void {
    let defaultStructProps = ['total', 'microsoftChargeMonth', 'macquarieBillMonth'];

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingSummaryViewModel(
        `Azure Essentials CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingSummaryViewModel(
        `Azure Essentials Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingSummaryViewModel(
        `Managed Azure CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingSummaryViewModel(
        `Managed Azure Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('CSPLICENSES',
      item => new BillingSummaryViewModel(
        `CSP Licenses`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingSummaryViewModel(
        `Software Subscriptions`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingSummaryViewModel(
        `Azure Essentials CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        item.isProjection
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingSummaryViewModel(
        `Azure Essentials Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingSummaryViewModel(
        `Managed Azure CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingSummaryViewModel(
        `Managed Azure Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingSummaryViewModel(
        `Azure Product Consumption`,
        this._getTooltipOptionsInfo(item, 'total', 'usdPerUnit', 'microsoftChargeMonth', 'macquarieBillMonth'),
        item.isProjection
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingSummaryViewModel(
        `Azure Reservation`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        item.isProjection
      )
    );
  }
}
