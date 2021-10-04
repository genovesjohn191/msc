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
import { FormControl } from '@angular/forms';
import {
  McsOption,
  McsReportBillingServiceGroup,
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
  createObject,
  getDateOnly,
  getTimestamp,
  isNullOrEmpty,
  removeSpaces,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingServiceItem } from './billing-service-item';

class BillingServiceStruct {
  constructor(
    public title: string,
    public includeMininumCommentNote: boolean,
    public items: McsOption[]
  ) { }
}

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
  public billingServices: BillingServiceItem[] = [];

  public fcBillingService: FormControl;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingAccountId: string = undefined;
  private _billingSeriesItems: BillingServiceItem[][] = [];
  private _billingSettingsMap = new Map<string, (item: BillingServiceItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingServiceItem) => BillingServiceStruct>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe,
    private _currencyPipe: StdCurrencyFormatPipe
  ) {
    super();
    this._registerFormControl();
    this._subscribeToBillingServiceControlChanges();

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

  public ngOnInit() {
    this._registerSettingsMap();
    this._registerBillingStructMap();

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
    apiQuery.billingAccountId = this._billingAccountId;

    this._apiService.getBillingSummaries(apiQuery).pipe(
      map(billingSummaries => {
        if (isNullOrEmpty(billingSummaries)) { return []; }

        let flatRecords = this._getFlatBillingServices(billingSummaries?.collection);
        this.billingServices = flatRecords;
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

  private _dataLabelFormatter(value: number, opts?: any): string {
    return this._currencyPipe.transform(value);
  }

  private _valueYFormatter(value: number): string {
    return this._currencyPipe.transform(value);
  }

  private _tooltipCustomFormatter(opts?: any): string {
    let serviceFound = this._billingSeriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(serviceFound)) { return null; }

    let billingKey = removeSpaces(serviceFound.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return `Nothing to display`; }

    let billingItemInfo = billingFuncFound(serviceFound);
    return this.generateCustomHtmlTooltip(
      billingItemInfo.title,
      billingItemInfo.items,
      billingItemInfo.includeMininumCommentNote &&
      !serviceFound.hasMetMinimumCommitment &&
      this._translate.instant('message.minimumSpendCommitmentNotMet')
    );
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
        xValue: billingService.timestamp,
        yValue: billingService.finalChargeDollars
      } as ChartItem);
    });

    // Populate billing services series index
    this._updateBillingSeriesItems(services);
    return chartItems;
  }

  private _updateBillingSeriesItems(services: BillingServiceItem[]): void {
    // Group them first by their service names
    let billingSeriesMap = new Map<string, BillingServiceItem[]>();
    services?.forEach(serviceItem => {
      let servicesFound = billingSeriesMap.get(serviceItem.service);
      if (!isNullOrEmpty(servicesFound)) {
        servicesFound.push(serviceItem);
        return;
      }

      let seriesItems = new Array<BillingServiceItem>();
      seriesItems.push(serviceItem);
      billingSeriesMap.set(serviceItem.service, seriesItems);
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

  private _getFlatBillingServices(billingGroups: McsReportBillingServiceGroup[]): BillingServiceItem[] {
    if (isNullOrEmpty(billingGroups)) { return null; }

    let billingServiceItems = new Array<BillingServiceItem>();

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        // Append Parent Service
        let parentBillingServiceItem = createObject(BillingServiceItem, {
          azureDescription: parentService.azureDescription || parentService.billingDescription,
          billingDescription: parentService.billingDescription,
          discountPercent: parentService.discountPercent,
          finalChargeDollars: parentService.finalChargeDollars,
          hasMetMinimumCommitment: parentService.hasMetMinimumCommitment,
          initialDomain: parentService.tenant?.initialDomain,
          installedQuantity: parentService.installedQuantity,
          isProjection: parentService.isProjection,
          macquarieBillMonth: this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
          microsoftChargeMonth: this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
          markupPercent: parentService.markupPercent,
          microsoftIdentifier: parentService.microsoftId,
          minimumCommitmentDollars: parentService.minimumCommitmentDollars,
          primaryDomain: parentService.tenant?.primaryDomain,
          productType: parentService.productType,
          service: parentService.serviceId,
          tenantName: parentService.tenant?.name,
          sortDate: getDateOnly(billingGroup.microsoftChargeMonth),
          timestamp: getTimestamp(billingGroup.microsoftChargeMonth)
        });
        billingServiceItems.push(parentBillingServiceItem);

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          let childBillingServiceItem = createObject(BillingServiceItem, {
            azureDescription: childService.azureDescription || childService.billingDescription,
            billingDescription: childService.billingDescription,
            discountPercent: childService.discountPercent,
            finalChargeDollars: childService.finalChargeDollars,
            hasMetMinimumCommitment: childService.hasMetMinimumCommitment,
            initialDomain: childService.tenant?.initialDomain,
            installedQuantity: childService.installedQuantity,
            isProjection: childService.isProjection,
            macquarieBillMonth: this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
            microsoftChargeMonth: this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
            markupPercent: childService.markupPercent,
            microsoftIdentifier: childService.microsoftId,
            minimumCommitmentDollars: childService.minimumCommitmentDollars,
            primaryDomain: childService.tenant?.primaryDomain,
            productType: childService.productType,
            service: childService.serviceId,
            tenantName: childService.tenant?.name,
            markupPercentParent: parentService.markupPercent,
            parentServiceId: parentService.serviceId,
            sortDate: getDateOnly(billingGroup.microsoftChargeMonth),
            timestamp: getTimestamp(billingGroup.microsoftChargeMonth)
          });
          billingServiceItems.push(childBillingServiceItem);
        });
      });
    });

    // Sort all billing services by month
    // billingServiceItems?.sort((first, second) => {
    //   return compareDates(first.sortDate, second.sortDate);
    // });
    return billingServiceItems;
  }

  private _registerFormControl(): void {
    this.fcBillingService = new FormControl('', []);
  }

  private _subscribeToBillingServiceControlChanges(): void {
    this.fcBillingService.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {
      this._onBillingServiceChange(change);
    });
  }

  private _onBillingServiceChange(services: BillingServiceItem[]): void {
    let serviceChartItems = this._convertFlatRecordsToChartItems(services);
    this._chartItemsChange.next(serviceChartItems);
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this._currencyPipe.transform(item.finalChargeDollars),
        this._translate.instant('label.total')
      )
    );

    this._billingSettingsMap.set('installedQuantity', item =>
      new McsOption(
        item.installedQuantity,
        this._translate.instant('label.installedQuantity')
      )
    );

    this._billingSettingsMap.set('discountOffRrp', item =>
      new McsOption(
        item.discountPercent && this._translate.instant('label.percentage', { value: item.discountPercent }),
        this._translate.instant('label.discountOffRrp')
      )
    );

    this._billingSettingsMap.set('linkManagementService', item =>
      new McsOption(
        item.parentServiceId,
        this._translate.instant('label.linkManagementService')
      )
    );

    this._billingSettingsMap.set('minimumSpendCommitment', item =>
      new McsOption(
        this._currencyPipe.transform(item.minimumCommitmentDollars),
        this._translate.instant('label.minimumSpendCommitment')
      )
    );

    this._billingSettingsMap.set('managementCharges', item =>
      new McsOption(
        item.markupPercent && this._translate.instant('message.markupPercent', { markup: item.markupPercent }),
        this._translate.instant('label.managementCharges')
      )
    );

    this._billingSettingsMap.set('managementChargesParent', item =>
      new McsOption(
        item.markupPercentParent && this._translate.instant('message.markupPercent', { markup: item.markupPercentParent }),
        this._translate.instant('label.managementCharges')
      )
    );

    this._billingSettingsMap.set('tenantName', item =>
      new McsOption(
        item.tenantName,
        this._translate.instant('label.tenantName')
      )
    );

    this._billingSettingsMap.set('initialDomain', item =>
      new McsOption(
        item.initialDomain,
        this._translate.instant('label.initialDomain')
      )
    );

    this._billingSettingsMap.set('primaryDomain', item =>
      new McsOption(
        item.primaryDomain,
        this._translate.instant('label.primaryDomain')
      )
    );

    this._billingSettingsMap.set('microsoftIdentifier', item =>
      new McsOption(
        item.microsoftIdentifier,
        this._translate.instant('label.microsoftIdentifier')
      )
    );

    this._billingSettingsMap.set('microsoftChargeMonth', item =>
      new McsOption(
        item.microsoftChargeMonth,
        this._translate.instant('label.microsoftChargeMonth')
      )
    );

    this._billingSettingsMap.set('macquarieBillMonth', item =>
      new McsOption(
        item.macquarieBillMonth,
        this._translate.instant('label.macquarieBillMonth')
      )
    );
  }

  private _getTooltipOptionsInfo(item: BillingServiceItem, ...propertyNames: string[]): McsOption[] {
    let tooltipOptions = new Array<McsOption>();

    propertyNames?.forEach(propertyName => {
      let propertyFound = this._billingSettingsMap.get(propertyName);
      if (isNullOrEmpty(propertyFound)) { return; }
      tooltipOptions.push(propertyFound(item));
    });
    return tooltipOptions;
  }

  private _registerBillingStructMap(): void {
    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingServiceStruct(`${item.azureDescription}`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService', 'managementChargesParent',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    // TODO(apascual): This item still under confirmation on jira FUSION-6581
    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.azureDescription}`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingServiceStruct(`${item.azureDescription}`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('CSPLICENSES',
      item => new BillingServiceStruct(`${item.azureDescription}`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingServiceStruct(`${item.azureDescription}`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}(Projected)`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}(Projected)`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}(Projected)`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.billingDescription} - ${item.service}(Projected)`, true,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingServiceStruct(`${item.azureDescription}(Projected)`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingServiceStruct(`${item.azureDescription}(Projected)`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingServiceStruct(`${item.azureDescription}(Projected)`, false,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth')
      )
    );
  }
}
