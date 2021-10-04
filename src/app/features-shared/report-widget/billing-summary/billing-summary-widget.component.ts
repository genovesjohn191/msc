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
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary,
  McsReportBillingSummaryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import {
  getDateOnly,
  getTimestamp,
  isNullOrEmpty,
  removeSpaces,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingSummaryItem } from './billing-summary-item';

const KEY_SEPARATOR = ':';

class BillingSummaryStruct {
  constructor(
    public title: string,
    public items: McsOption[]
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
  public billingAccountId: string;

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingSummaryItemsMap = new Map<string, BillingSummaryItem[]>();
  private _billingSeriesItems: BillingSummaryItem[][] = [];
  private _billingSettingsMap = new Map<string, (item: BillingSummaryItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingSummaryItem) => BillingSummaryStruct>();

  public constructor(
    private _translate: TranslateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe,
    private _currencyPipe: StdCurrencyFormatPipe
  ) {
    super();

    this.chartConfig = {
      type: 'bar',
      stacked: true,
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        title: 'Your Bill',
        showLabel: true,
        valueFormatter: this._valueYFormatter.bind(this)
      },
      tooltip: {
        customFormatter: this._tooltipCustomFormatter.bind(this)
      },
      dataLabels: {
        enabled: true,
        formatter: this._dataLabelFormatter.bind(this),
        offsetX: -25
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      }
    };
  }

  public ngOnInit(): void {
    this._registerSettingsMap();
    this._registerBillingStructMap();

    this._subscribeToChartItemsChange();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingAccountIdChange = changes['billingAccountId'];
    if (!isNullOrEmpty(billingAccountIdChange)) {
      this.getBillingSummaries();
    }
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

  private _dataLabelFormatter(value: number, opts?: any): string {
    return this._currencyPipe.transform(value);
  }

  private _valueYFormatter(value: number): string {
    return this._currencyPipe.transform(value);
  }

  private _tooltipCustomFormatter(opts?: any): string {
    let billingFound = this._billingSeriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(billingFound)) { return null; }

    let billingKey = removeSpaces(billingFound.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return `Nothing to display`; }

    let billingItemInfo = billingFuncFound(billingFound);
    return this.generateCustomHtmlTooltip(
      billingItemInfo.title,
      billingItemInfo.items
    );
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
        getDateOnly(new Date(+actualDate)),
        +actualDate
      ));
    });

    // Sort records
    // billingSummaries.sort((first, second) => {
    //   return compareDates(second.sortDate, first.sortDate);
    // });

    // Convert to chart items
    let chartItems = new Array<ChartItem>();
    billingSummaries?.forEach(billingSummary => {
      chartItems.push({
        name: billingSummary.productType,
        xValue: billingSummary.timestamp,
        yValue: billingSummary.finalChargeDollars
      } as ChartItem);
    });

    // Populate billing services series index
    this._updateBillingSeriesItems(billingSummaries);
    return chartItems;
  }

  private _updateBillingSeriesItems(summaries: BillingSummaryItem[]): void {
    // Group them first by their service names
    let billingSeriesMap = new Map<string, BillingSummaryItem[]>();
    summaries?.forEach(summaryItem => {
      let servicesFound = billingSeriesMap.get(summaryItem.productType);
      if (!isNullOrEmpty(servicesFound)) {
        servicesFound.push(summaryItem);
        return;
      }

      let seriesItems = new Array<BillingSummaryItem>();
      seriesItems.push(summaryItem);
      billingSeriesMap.set(summaryItem.productType, seriesItems);
    });

    // Update the indexing on the tooltip
    this._billingSeriesItems = [];
    let seriesIndex = 0;
    billingSeriesMap.forEach((items, key) => {
      this._billingSeriesItems[seriesIndex] = [];

      let dataPointIndex = 0;
      items.forEach(item => {
        this._billingSeriesItems[seriesIndex][dataPointIndex] = item;
        dataPointIndex++;
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
          parentService.isProjection,
          billingGroup.microsoftChargeMonth,
          billingGroup.macquarieBillMonth,
          parentService
        );

        // Append Child Services Data
        parentService?.childBillingServices?.forEach(childService => {
          this._appendBillingSummaryToMap(
            this._generateItemKey(childService.productType, getDateOnly(billingGroup.microsoftChargeMonth)),
            childService.isProjection,
            billingGroup.microsoftChargeMonth,
            billingGroup.macquarieBillMonth,
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
        getDateOnly(chargeMonth)
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
      getDateOnly(chargeMonth)
    ));
    this._billingSummaryItemsMap.set(productTypeKey, services);
  }

  private _generateItemKey(type: string, date: Date): string {
    return `${type}${KEY_SEPARATOR}${getTimestamp(date)}`;
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this._currencyPipe.transform(item.finalChargeDollars),
        this._translate.instant('label.total')
      )
    );

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
      item => new BillingSummaryStruct(
        `Azure Essentials CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingSummaryStruct(
        `Azure Essentials Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingSummaryStruct(
        `Managed Azure CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingSummaryStruct(
        `Managed Azure Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingSummaryStruct(
        `Azure Product Consumption`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingSummaryStruct(
        `Azure Reservation`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('CSPLICENSES',
      item => new BillingSummaryStruct(
        `CSP Licenses`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingSummaryStruct(
        `Software Subscriptions`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingSummaryStruct(
        `Azure Essentials CSP (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingSummaryStruct(
        `Azure Essentials Enterprise Agreement (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingSummaryStruct(
        `Managed Azure CSP (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingSummaryStruct(
        `Managed Azure Enterprise Agreement (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingSummaryStruct(
        `Azure Product Consumption (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingSummaryStruct(
        `Azure Reservation (Projected)`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps)
      )
    );
  }
}
