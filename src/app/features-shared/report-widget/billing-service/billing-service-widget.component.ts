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
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { McsReportingService } from '@app/core';
import {
  McsOption,
  McsOptionGroup,
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
  unsubscribeSafely,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingServiceItem } from './billing-service-item';

const PROJECT_TEXT = '(Projected)';

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

  public servicesDatasource: TreeDatasource<McsReportBillingServiceGroup>;

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;

  public hasError: boolean = false;
  public processing: boolean = true;
  public fcBillingService = new FormControl('', []);

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingSeriesItems: BillingServiceItem[][] = [];
  private _billingSettingsMap = new Map<string, (item: BillingServiceItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingServiceItem) => BillingServiceViewModel>();

  private _billingServicesChange = new BehaviorSubject<BillingServiceItem[]>(null);
  private _billingServiceGroupsChange = new BehaviorSubject<McsOptionGroup[]>(null);

  public constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _translate: TranslateService,
    private _decimalPipe: DecimalPipe,
    private _datePipe: StdDateFormatPipe,
    private _currencyPipe: StdCurrencyFormatPipe,
    private _reportingService: McsReportingService
  ) {
    super();
    this._subscribeToBillingServiceControlChanges();
    this.servicesDatasource = new TreeDatasource(this._convertGroupServicesToTreeItems.bind(this));

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
        position: 'right',
        horizontalAlign: 'left'
      }
    };

    this._registerSettingsMap();
    this._registerBillingStructMap();
  }

  public ngOnInit() {
    this._subscribeToChartItemsChange();
    this.displayAllBillingServices(true);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingSummariesChange = changes['billingSummaries'];
    if (!isNullOrEmpty(billingSummariesChange)) {
      this.displayAllBillingServices(true);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public displayAllBillingServices(updateGroup?: boolean): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);

    if (!isNullOrEmpty(this.billingSummaries)) {
      let flatRecords = this._getFlatBillingServices(this.billingSummaries);
      this._billingServicesChange.next(flatRecords);

      if (updateGroup) {
        let groupRecords = this._getGroupBillingServices(flatRecords);
        this._billingServiceGroupsChange.next(groupRecords);
      };

      let chartItems = this._convertFlatRecordsToChartItems(flatRecords);
      this._chartItemsChange.next(chartItems);

      this._updateChartColors(chartItems);
      this.processing = isNullOrUndefined(this.billingSummaries);
      if (chartItems?.length === 0) { this.updateChartUri(''); }
    }
    this._changeDetectorRef.markForCheck();
  }

  private _updateChartColors(chartItems: ChartItem[]): void {
    if (isNullOrEmpty(chartItems)) { return; }

    let chartNames = chartItems?.map(item => item.name) || [];

    let uniqueNames = [...new Set(chartNames)];
    let createdColors = uniqueNames.map(name => name.toHex());
    let colorsFunc = createdColors.map((color, index) =>
      itemFunc => this._colorFunc(itemFunc, color, index));

    this.chartConfig.colors = colorsFunc;
    this._changeDetectorRef.markForCheck();
  }

  private _colorFunc(opts: any, definedColor: string, index: number): string {
    if (isNullOrEmpty(this._billingSeriesItems)) { return definedColor; }

    let serviceFound = this._billingSeriesItems[opts.seriesIndex][opts.dataPointIndex];
    let billingStruct = this._getBillingViewModelByItem(serviceFound);
    let billingTitle = this._generateBillingTitle(billingStruct);

    return billingTitle?.includes(PROJECT_TEXT) ? definedColor.toDefinedGreyHex(index) : definedColor;
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
      `${billingStruct.title} ${PROJECT_TEXT}` : billingStruct?.title;
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _convertGroupServicesToTreeItems(): Observable<TreeItem<string>[]> {
    return this._billingServiceGroupsChange.pipe(
      map(groups =>
        TreeUtility.convertEntityToTreemItems(groups,
          group => new TreeGroup(group.groupName, group.groupName, group.options, {
            selectable: true,
            excludeFromSelection: true
          }),
          option => new TreeGroup(option.text, option.value, null, {
            selectable: true
          })
        )
      )
    );
  }

  private _convertFlatRecordsToChartItems(services: BillingServiceItem[]): ChartItem[] {
    if (isNullOrEmpty(services)) { return []; }

    services?.sort((first, second) =>
      compareDates(first.sortDate, second.sortDate)
    );

    let chartItems = new Array<ChartItem>();
    services.forEach(billingService => {
      if (isNullOrEmpty(billingService)) { return; }

      let billingViewModel = this._getBillingViewModelByItem(billingService);
      let billingTitle = this._generateBillingTitle(billingViewModel);
      let chartItem = {
        name: billingTitle,
        xValue: billingService.microsoftChargeMonth,
        yValue: billingService.finalChargeDollars
      } as ChartItem;

      chartItems.push(chartItem);
    });
    let newChartItems = this._reportingService.fillMissingChartItems(chartItems);

    // Populate billing services series index
    this._updateBillingSeriesItems(newChartItems, services);
    return newChartItems;
  }

  private _getBillingViewModelByItem(service: BillingServiceItem): BillingServiceViewModel {
    let billingKey = removeSpaces(service?.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(service);
  }

  private _updateBillingSeriesItems(chartItems: ChartItem[], services: BillingServiceItem[]): void {
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

        let serviceFound = services.find(service => {
          let billingViewModel = this._getBillingViewModelByItem(service);
          let billingTitle = this._generateBillingTitle(billingViewModel);
          return billingTitle === item.name &&
            service.microsoftChargeMonth === item.xValue;
        });
        this._billingSeriesItems[seriesIndex][pointIndex] = serviceFound;
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
          isProjection: billingGroup.isProjection,
          macquarieBillMonth: this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
          microsoftChargeMonth: this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
          markupPercent: parentService.markupPercent,
          microsoftIdentifier: parentService.microsoftId,
          minimumCommitmentDollars: parentService.minimumCommitmentDollars,
          primaryDomain: parentService.tenant?.primaryDomain,
          productType: parentService.productType,
          serviceId: parentService.serviceId,
          tenantName: parentService.tenant?.name,
          sortDate: getDateOnly(billingGroup.microsoftChargeMonth),
          timestamp: getTimestamp(billingGroup.microsoftChargeMonth),
          usdPerUnit: billingGroup.usdPerUnit
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
            isProjection: billingGroup.isProjection,
            macquarieBillMonth: this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
            microsoftChargeMonth: this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
            markupPercent: childService.markupPercent,
            microsoftIdentifier: childService.microsoftId,
            minimumCommitmentDollars: childService.minimumCommitmentDollars,
            primaryDomain: childService.tenant?.primaryDomain,
            productType: childService.productType,
            serviceId: childService.serviceId,
            tenantName: childService.tenant?.name,
            markupPercentParent: parentService.markupPercent,
            parentServiceId: parentService.serviceId,
            sortDate: getDateOnly(billingGroup.microsoftChargeMonth),
            timestamp: getTimestamp(billingGroup.microsoftChargeMonth),
            usdPerUnit: billingGroup.usdPerUnit
          });
          billingServiceItems.push(childBillingServiceItem);
        });
      });
    });
    return billingServiceItems;
  }

  private _getGroupBillingServices(flatRecords: BillingServiceItem[]): McsOptionGroup[] {
    if (isNullOrEmpty(flatRecords)) { return null; }
    let groupRecords = new Array<McsOptionGroup>();
    let groupRecordsMap = new Map<string, McsOption[]>();
    let groupRecordProductsMap = new Map<string, BillingServiceItem>();

    // Group records by product type
    flatRecords?.forEach(flatRecord => {
      let options = new Array<McsOption>();
      let groupFound = groupRecordsMap.get(flatRecord.productType);

      !isNullOrEmpty(groupFound) ?
        options = groupFound :
        groupRecordProductsMap.set(flatRecord.productType, flatRecord);

      options.push(new McsOption(flatRecord, flatRecord.serviceId));
      groupRecordsMap.set(flatRecord.productType, options);
    });

    // Update mapping
    groupRecordsMap.forEach((options, productType) => {
      let groupRecord = groupRecordProductsMap.get(productType);
      let uniqueRecords = options.distinct(item => item.text);
      groupRecords.push(new McsOptionGroup(groupRecord?.billingDescription, ...uniqueRecords));
    });
    return groupRecords;
  }

  private _subscribeToBillingServiceControlChanges(): void {
    this.fcBillingService.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {

      isNullOrEmpty(change) ?
        this.displayAllBillingServices() :
        this._filterBillingServices(change);
    });
  }

  private _filterBillingServices(distinctServices: BillingServiceItem[]): void {
    let filteredServices = this._billingServicesChange.getValue()
      ?.filter(billingService => {
        return !!distinctServices.find(distinctService =>
          distinctService.serviceId === billingService.serviceId);
      });
    let serviceChartItems = this._convertFlatRecordsToChartItems(filteredServices);
    this._updateChartColors(serviceChartItems);
    this._chartItemsChange.next(serviceChartItems);
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

    this._billingSettingsMap.set('serviceId', item =>
      new McsOption(
        item.serviceId,
        this._translate.instant('label.serviceId')
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
    this._billingStructMap.set('CSPLICENSES',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, false
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'usdPerUnit', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingServiceViewModel(
        `${item.azureDescription}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );
  }
}
