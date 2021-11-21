import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injector } from '@angular/core';
import {
  McsOption,
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary
} from '@app/models';
import {
  ChartColorFuncType,
  ChartItem
} from '@app/shared';
import {
  compareDates,
  getDateOnly,
  getTimestamp,
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  Guid
} from '@app/utilities';

import {
  BillingOperationBase,
  KEY_SEPARATOR,
  PROJECT_TEXT
} from '../abstractions/billing-operation.base';
import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { BillingOperationData } from '../models/billing-operation-data';
import { BillingOperationViewModel } from '../models/billing-operation-viewmodel';
import { BillingSummaryItem } from '../models/billing-summary-item';

export class BillingSummaryOperation
  extends BillingOperationBase
  implements IBillingOperation<McsReportBillingServiceGroup, BillingSummaryItem> {

  private _dataChange = new BehaviorSubject<BillingOperationData<BillingSummaryItem>>(null);
  private _dataGroupsChange = new BehaviorSubject<McsReportBillingServiceGroup[]>(null);

  private _billingSummaryItemsMap = new Map<string, BillingSummaryItem[]>();
  private _billingSettingsMap = new Map<string, (item: BillingSummaryItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingSummaryItem) => BillingOperationViewModel>();

  constructor(injector: Injector) {
    super(injector);

    this._registerSettingsMap();
    this._registerBillingStructMap();
  }

  public initializeData(groups: McsReportBillingServiceGroup[]): void {
    this._dataGroupsChange.next(groups);
    this._initializeDataByDataGroup();
  }

  public operationDataChange(): Observable<BillingOperationData<BillingSummaryItem>> {
    return this._dataChange.asObservable();
  }

  public getOperationData(): BillingOperationData<BillingSummaryItem> {
    return this._dataChange.getValue();
  }

  public filterOperationData(filterPred: (item: BillingSummaryItem) => boolean): void {
    this._initializeDataByDataGroup(filterPred);
  }

  public reset(): void {
    this._initializeDataByDataGroup();
  }

  private _initializeDataByDataGroup(filterPred?: (item: BillingSummaryItem) => boolean): void {
    this._populateBillingMap();
    this._generateBillingOperationData(filterPred);
  }

  private _generateBillingOperationData(filterPred: (item: BillingSummaryItem) => boolean): void {
    let dataOperation = new BillingOperationData<BillingSummaryItem>();
    dataOperation.summaryItems = this._createBillingSummaries(filterPred);
    dataOperation.chartItems = this._createChartItems(dataOperation.summaryItems);
    dataOperation.seriesItems = this._createSeriesItems(dataOperation.chartItems, dataOperation.summaryItems);
    dataOperation.chartColors = this._createChartColors(dataOperation.chartItems, dataOperation.seriesItems);
    dataOperation.getViewModelFunc = this._getBillingViewModelByItem.bind(this);
    dataOperation.getTitleFunc = this._generateBillingTitle.bind(this);

    this._dataChange.next(dataOperation);
  }

  private _populateBillingMap(): void {
    let billingGroups = this._dataGroupsChange.getValue();
    if (isNullOrEmpty(billingGroups)) { return; }

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

  private _createBillingSummaries(filterPred?: (item: BillingSummaryItem) => boolean): BillingSummaryItem[] {
    let billingSummaries = new Array<BillingSummaryItem>();

    this._billingSummaryItemsMap.forEach((billingItems, productTypeKey) => {
      if (isNullOrEmpty(billingItems)) { return; }

      let totalChargeDollars = billingItems
        ?.map(item => item.finalChargeDollars)
        .reduce((total, next) => total + next, 0);

      let productType = productTypeKey.split(KEY_SEPARATOR)[0];
      let actualDate = productTypeKey.split(KEY_SEPARATOR)[1];

      let service = new BillingSummaryItem();
      service.id = Guid.newGuid().toString();
      service.productType = productType;
      service.isProjection = billingItems[0].isProjection;
      service.microsoftChargeMonth = billingItems[0].microsoftChargeMonth;
      service.macquarieBillMonth = billingItems[0].macquarieBillMonth;
      service.finalChargeDollars = totalChargeDollars;
      service.usdPerUnit = billingItems[0].usdPerUnit;
      service.sortDate = getDateOnly(new Date(+actualDate));
      service.timestamp = +actualDate;

      if (!filterPred || filterPred(service)) {
        billingSummaries.push(service);
      }
    });

    billingSummaries?.sort((first, second) =>
      compareDates(first.sortDate, second.sortDate)
    );
    return billingSummaries;
  }

  private _createChartItems(series: BillingSummaryItem[]): ChartItem[] {
    // Convert to chart items
    let chartItems = new Array<ChartItem>();
    series?.forEach(billingSummary => {
      let billingViewModel = this._getBillingViewModelByItem(billingSummary);
      let billingTitle = this._generateBillingTitle(billingViewModel);

      chartItems.push({
        id: billingSummary.id,
        name: billingTitle,
        xValue: billingSummary.microsoftChargeMonth,
        yValue: billingSummary.finalChargeDollars
      } as ChartItem);
    });
    return this.reportingService.fillMissingChartItems(chartItems);
  }

  private _createSeriesItems(
    chartItems: ChartItem[],
    summaries: BillingSummaryItem[]
  ): BillingSummaryItem[][] {
    // Group them first by their service names
    let billingSeriesItems: BillingSummaryItem[][] = [];

    let seriesIndex = 0;
    let billingSeriesMap = new Map<string, ChartItem[]>();
    chartItems?.forEach(chartItem => {
      let summaryFound = summaries.find(service => service.id === chartItem.id);

      let chartItemsFound = billingSeriesMap.get(chartItem.name);
      if (!isNullOrEmpty(chartItemsFound)) {
        let arrayKeys = [...billingSeriesMap.keys()];
        let mapIndex = 0;

        for (const key of arrayKeys) {
          if (key === chartItem.name) { break; }
          ++mapIndex;
        }

        billingSeriesItems[mapIndex][chartItemsFound.length] = summaryFound;
        chartItemsFound.push(chartItem);
        return;
      }

      let chartItemList = new Array<ChartItem>();
      chartItemList.push(chartItem);
      billingSeriesMap.set(chartItem.name, chartItemList);

      // Initialize billing series multi array, we always set the pointindex 0 here
      billingSeriesItems[seriesIndex] = [];
      billingSeriesItems[seriesIndex][0] = summaryFound;
      seriesIndex++;
    });

    return billingSeriesItems;
  }

  private _createChartColors(
    chartItems: ChartItem[],
    seriesItems: BillingSummaryItem[][]
  ): ChartColorFuncType<BillingSummaryItem>[] {
    if (isNullOrEmpty(chartItems)) { return; }

    let chartNames = chartItems?.map(item => item.name) || [];

    let uniqueNames = [...new Set(chartNames)];
    let createdColors = uniqueNames.map(name => name?.toHex());
    let colorsFunc = createdColors.map((color, index) =>
      itemFunc => this._colorFunc(itemFunc, color, index, seriesItems));

    return colorsFunc;
  }

  private _colorFunc(
    opts: any,
    definedColor: string,
    index: number,
    seriesItems: BillingSummaryItem[][]
  ): string {
    if (isNullOrEmpty(seriesItems)) { return definedColor; }

    let serviceFound = seriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(serviceFound)) { return definedColor; }

    let billingStruct = this._getBillingViewModelByItem(serviceFound);
    let billingTitle = this._generateBillingTitle(billingStruct);
    return billingTitle?.includes(PROJECT_TEXT) ? definedColor.toDefinedGreyHex(index) : definedColor;
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

    let newService = new BillingSummaryItem();
    newService.id = Guid.newGuid().toString();
    newService.productType = productTypeKey;
    newService.isProjection = isProjection;
    newService.microsoftChargeMonth = this.datePipe.transform(getDateOnly(chargeMonth), 'shortMonthYear');
    newService.macquarieBillMonth = this.datePipe.transform(getDateOnly(billMonth), 'shortMonthYear');
    newService.finalChargeDollars = finalChargeDollars;
    newService.usdPerUnit = usdPerUnit;
    newService.sortDate = getDateOnly(chargeMonth);
    newService.timestamp = getTimestamp(chargeMonth);

    if (!isNullOrEmpty(serviceFound)) {
      services.push(newService);
      return;
    }

    services = new Array<BillingSummaryItem>();
    services.push(newService);
    this._billingSummaryItemsMap.set(productTypeKey, services);
  }

  private _generateItemKey(type: string, date: Date): string {
    return `${type}${KEY_SEPARATOR}${getTimestamp(date)}`;
  }

  private _getBillingViewModelByItem(summary: BillingSummaryItem): BillingOperationViewModel {
    if (isNullOrEmpty(summary)) { return null; }

    let billingKey = removeSpaces(summary?.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(summary);
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

  private _generateBillingTitle(billingViewModel: BillingOperationViewModel): string {
    if (isNullOrEmpty(billingViewModel)) { return null; }

    return billingViewModel?.includeProjectionSuffix ?
      `${billingViewModel.title} ${PROJECT_TEXT}` : billingViewModel?.title;
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this.currencyPipe.transform(item.finalChargeDollars),
        this.translate.instant('label.total')
      )
    );

    this._billingSettingsMap.set('usdPerUnit', item => {
      let usdPerUnitValue = null;
      if (this.isDateGreaterThanExpiry(item.timestamp)) {
        if (isNullOrUndefined(item.usdPerUnit)) {
          usdPerUnitValue = this.translate.instant('message.notYetAvailable');
        } else {
          usdPerUnitValue = item.usdPerUnit;
        }
      }

      return new McsOption(
        usdPerUnitValue,
        this.translate.instant('label.audUsdExchangeRate')
      )
    });

    this._billingSettingsMap.set('microsoftChargeMonth', item =>
      new McsOption(
        item?.microsoftChargeMonth,
        this.translate.instant('label.microsoftChargeMonth')
      )
    );

    this._billingSettingsMap.set('macquarieBillMonth', item =>
      new McsOption(
        item?.macquarieBillMonth,
        this.translate.instant('label.macquarieBillMonth')
      )
    );
  }

  private _registerBillingStructMap(): void {
    let defaultStructProps = ['total', 'microsoftChargeMonth', 'macquarieBillMonth'];

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingOperationViewModel(
        `Azure Essentials CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `Azure Essentials Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingOperationViewModel(
        `Managed Azure CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `Managed Azure Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('CSPLICENSES',
      item => new BillingOperationViewModel(
        `CSP Licenses`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingOperationViewModel(
        `Software Subscriptions`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingOperationViewModel(
        `Azure Essentials CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        item.isProjection
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `Azure Essentials Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingOperationViewModel(
        `Managed Azure CSP`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `Managed Azure Enterprise Agreement`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingOperationViewModel(
        `Azure Product Consumption`,
        this._getTooltipOptionsInfo(item, 'total', 'usdPerUnit', 'microsoftChargeMonth', 'macquarieBillMonth'),
        false,
        item.isProjection
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingOperationViewModel(
        `Azure Reservation`,
        this._getTooltipOptionsInfo(item, ...defaultStructProps),
        false,
        item.isProjection
      )
    );
  }

}