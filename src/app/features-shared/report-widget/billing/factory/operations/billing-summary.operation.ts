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
  hashString,
  Guid
} from '@app/utilities';

import {
  BillingOperationBase,
  KEY_SEPARATOR
} from '../abstractions/billing-operation.base';
import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { BillingOperationData } from '../models/billing-operation-data';
import { BillingOperationViewModel } from '../models/billing-operation-viewmodel';
import { BillingSummaryItem } from '../models/billing-summary-item';
import { billingKnownProductTypes } from '../models/bill-summary-known-product-type';
import { billingColors } from '../models/bill-summary-colors';

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
        if ((isNullOrUndefined(parentService.productType) || (!billingKnownProductTypes.some(
          billingKnownProductType => billingKnownProductType.key.includes(parentService.productType.toUpperCase()))))) {
          return;
        }

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
          if ((isNullOrUndefined(childService.productType) ||
            (!billingKnownProductTypes.some(
              billingKnownProductType => billingKnownProductType.key.includes(childService.productType.toUpperCase()))))) {
            return;
          }

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
        ?.map(item => item.gstExclusiveChargeDollars)
        .reduce((total, next) => total + next, 0);

      let productType = productTypeKey.split(KEY_SEPARATOR)[0];
      let actualDate = productTypeKey.split(KEY_SEPARATOR)[1];

      let service = new BillingSummaryItem();
      service.id = Guid.newGuid().toString();
      service.productType = productType;
      service.isProjection = billingItems[0].isProjection;
      service.microsoftChargeMonth = billingItems[0].microsoftChargeMonth;
      service.macquarieBillMonth = billingItems[0].macquarieBillMonth;
      service.gstExclusiveChargeDollars = totalChargeDollars;
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
        yValue: billingSummary.gstExclusiveChargeDollars
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

    let uniqueNames = [...new Set(chartNames)]
      .filter(name => !isNullOrUndefined(name));
    if (isNullOrEmpty(uniqueNames)) { return; }

    // Use predefined colours for each item
    // If predefined colours run out, hashes each distinct name and uses it as seed for hex colour generation
    let createdColors = uniqueNames?.map((name, nameIndex) => {
      return (nameIndex < billingColors.length)? billingColors[nameIndex++] : hashString(name).toHex();
    });
    return createdColors.map((color, index) =>
      itemFunc => color);
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

    let gstExclusiveChargeDollars = data instanceof McsReportBillingService ?
      data.gstExclusiveChargeDollars : data.gstExclusiveChargeDollars;

    let newService = new BillingSummaryItem();
    newService.id = Guid.newGuid().toString();
    newService.productType = productTypeKey;
    newService.isProjection = isProjection;
    newService.microsoftChargeMonth = this.datePipe.transform(getDateOnly(chargeMonth), 'shortMonthYear') + (isProjection ? '*' : '');
    newService.macquarieBillMonth = this.datePipe.transform(getDateOnly(billMonth), 'shortMonthYear') + (isProjection ? '*' : '');
    newService.gstExclusiveChargeDollars = gstExclusiveChargeDollars;
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
    if (isNullOrEmpty(billingViewModel)) { return ''; }

    return billingViewModel?.title;
  }

  private _registerSettingsMap(): void {
    this._billingSettingsMap.set('total', item =>
      new McsOption(
        this.currencyPipe.transform(item.gstExclusiveChargeDollars),
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

    // create view model for each known billing product type
    billingKnownProductTypes.forEach((billingKnownProductType) => {
      this._billingStructMap.set(billingKnownProductType.key,
        item => new BillingOperationViewModel(
          billingKnownProductType.friendlyName,
          this._getTooltipOptionsInfo(item,...(!(billingKnownProductType.aggregatedCustomTooltipFields.length > 0)
            ? defaultStructProps : billingKnownProductType.aggregatedCustomTooltipFields)),
          false, // this is always false for aggregate-level items
          (item.isProjection)? item.isProjection : false
        )
      );
    });
  }

}
