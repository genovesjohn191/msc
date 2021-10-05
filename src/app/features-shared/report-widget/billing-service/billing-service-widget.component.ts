import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
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
  McsReportBillingServiceGroup
} from '@app/models';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import {
  compareDates,
  createObject,
  getDateOnly,
  getTimestamp,
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingServiceItem } from './billing-service-item';

class BillingServiceViewModel {
  constructor(
    public title: string,
    public items: McsOption[],
    public includeMininumCommentNote: boolean,
    public includeProjectionSuffix: boolean
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
  public billingSummaries: McsReportBillingServiceGroup[];

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;
  public billingServices: BillingServiceItem[] = [];

  public fcBillingService: FormControl;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingSeriesItems: BillingServiceItem[][] = [];
  private _billingSettingsMap = new Map<string, (item: BillingServiceItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingServiceItem) => BillingServiceViewModel>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
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

    this._registerSettingsMap();
    this._registerBillingStructMap();
  }

  public ngOnInit() {
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
      let flatRecords = this._getFlatBillingServices(this.billingSummaries);
      this.billingServices = flatRecords;

      let chartItems = this._convertFlatRecordsToChartItems(flatRecords);
      this._chartItemsChange.next(chartItems);

      this.processing = isNullOrUndefined(this.billingSummaries);
      if (chartItems?.length === 0) { this.updateChartUri(''); }
    }
    this._changeDetectorRef.markForCheck();
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

    let billingStruct = this._getBillingViewModelByItem(serviceFound);
    let billingTitle = this._generateBillingTitle(billingStruct);

    return this.generateCustomHtmlTooltip(
      billingTitle,
      billingStruct.items,
      billingStruct.includeMininumCommentNote &&
      !serviceFound.hasMetMinimumCommitment &&
      serviceFound.minimumCommitmentDollars &&
      this._translate.instant('message.minimumSpendCommitmentNotMet')
    );
  }

  private _generateBillingTitle(billingStruct: BillingServiceViewModel): string {
    return billingStruct?.includeProjectionSuffix ?
      `${billingStruct.title} (Projected)` : billingStruct?.title;
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

      let billingViewModel = this._getBillingViewModelByItem(billingService);
      let billingTitle = this._generateBillingTitle(billingViewModel);

      chartItems.push({
        name: billingTitle,
        xValue: billingService.timestamp,
        yValue: billingService.finalChargeDollars
      } as ChartItem);
    });

    // Populate billing services series index
    this._updateBillingSeriesItems(services);
    return chartItems;
  }

  private _getBillingViewModelByItem(service: BillingServiceItem): BillingServiceViewModel {
    let billingKey = removeSpaces(service.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(service);
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
          usdPerUnit: parentService.usdPerUnit,
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
            usdPerUnit: childService.usdPerUnit,
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

  private _isDateGreaterThanExpiry(timestamp: number): boolean {
    let novemberDate = new Date();
    novemberDate.setFullYear(2021, 10, 1);
    return compareDates(new Date(timestamp), novemberDate) === 1;
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this._currencyPipe.transform(item.finalChargeDollars),
        this._translate.instant('label.total')
      )
    );

    this._billingSettingsMap.set('usdPerUnit', item =>
      new McsOption(
        this._isDateGreaterThanExpiry(item.timestamp) && item.usdPerUnit,
        this._translate.instant('label.audUsdExchangeRate')
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
        item.microsoftIdentifier || 'Unknown',
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
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, false
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, false
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, false
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'usdPerUnit', 'discountOffRrp', 'linkManagementService', 'managementChargesParent',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, false
      )
    );

    // TODO(apascual): This item still under confirmation on jira FUSION-6581
    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, false
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, false
      )
    );

    this._billingStructMap.set('CSPLICENSES',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, false
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.service}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false, item.isProjection
      )
    );
  }
}
