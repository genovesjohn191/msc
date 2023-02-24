import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injector } from '@angular/core';
import {
  McsOption,
  McsReportBillingServiceGroup
} from '@app/models';
import {
  ChartColorFuncType,
  ChartItem
} from '@app/shared';
import {
  compareDates,
  createObject,
  getDateOnly,
  getTimestamp,
  hashString,
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  Guid
} from '@app/utilities';

import { BillingOperationBase } from '../abstractions/billing-operation.base';
import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { billingColors } from '../models/bill-summary-colors';
import { billingKnownProductTypes } from '../models/bill-summary-known-product-type';
import { BillingOperationData } from '../models/billing-operation-data';
import { BillingOperationViewModel } from '../models/billing-operation-viewmodel';
import { BillingServiceItem } from '../models/billing-service-item';

export class BillingServiceOperation
  extends BillingOperationBase<BillingServiceItem>
  implements IBillingOperation<McsReportBillingServiceGroup, BillingServiceItem> {

  private _dataChange = new BehaviorSubject<BillingOperationData<BillingServiceItem>>(null);
  private _dataGroupsChange = new BehaviorSubject<McsReportBillingServiceGroup[]>(null);

  private _billingSettingsMap = new Map<string, (item: BillingServiceItem) => McsOption>();
  private _billingStructMap = new Map<string, (item: BillingServiceItem) => BillingOperationViewModel>();
  private _billingNameMap = new Map<string, string>();

  constructor(injector: Injector) {
    super(injector);

    this._registerSettingsMap();
    this._registerBillingStructMap();
    this._registerBillingNameMap();
  }

  public initializeData(groups: McsReportBillingServiceGroup[]): void {
    this._dataGroupsChange.next(groups);
    this._initializeDataByDataGroup();
  }

  public operationDataChange(): Observable<BillingOperationData<BillingServiceItem>> {
    return this._dataChange.asObservable();
  }

  public getOperationData(): BillingOperationData<BillingServiceItem> {
    return this._dataChange.getValue();
  }

  public filterOperationData(filterPred: (item: BillingServiceItem) => boolean): void {
    this._initializeDataByDataGroup(filterPred);
  }

  public reset(): void {
    this._initializeDataByDataGroup();
  }

  protected mapToChartItem(billingService: BillingServiceItem): ChartItem {
    let billingViewModel = this.viewModelFunc(billingService);
    let billingTitle = this._generateBillingTitle(billingViewModel);
    let chartItem = {
      id: billingService.id,
      name: billingTitle,
      xValue: billingService.microsoftChargeMonth,
      yValue: billingService.gstExclusiveChargeDollars
    } as ChartItem;

    return chartItem;
  }

  protected viewModelFunc(service: BillingServiceItem): BillingOperationViewModel {
    if (isNullOrEmpty(service)) { return null; }

    let billingKey = removeSpaces(service?.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(service);
  }

  private _initializeDataByDataGroup(filterPred?: (item: BillingServiceItem) => boolean): void {
    this._generateBillingOperationData(filterPred);
  }

  private _generateBillingOperationData(filterPred: (item: BillingServiceItem) => boolean): void {
    let dataOperation = new BillingOperationData<BillingServiceItem>();
    dataOperation.summaryItems = this._createBillingSummaries(filterPred);
    dataOperation.chartItems = this._createChartItems(dataOperation.summaryItems);
    dataOperation.seriesItems = this._createSeriesItems(dataOperation.chartItems, dataOperation.summaryItems);
    dataOperation.chartColors = this._createChartColors(dataOperation.chartItems);
    dataOperation.getViewModelFunc = this.viewModelFunc.bind(this);
    dataOperation.getTitleFunc = this._generateBillingTitle.bind(this);
    dataOperation.getNameFunc = this._generateBillingName.bind(this);

    this._dataChange.next(dataOperation);
  }

  private _createBillingSummaries(filterPred?: (item: BillingServiceItem) => boolean): BillingServiceItem[] {
    let billingGroups = this._dataGroupsChange.getValue();
    if (isNullOrEmpty(billingGroups)) { return null; }

    let billingServiceItems = new Array<BillingServiceItem>();

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        if ((isNullOrUndefined(parentService.productType) || (!billingKnownProductTypes.some(
          billingKnownProductType => billingKnownProductType.key.includes(parentService.productType.toUpperCase()))))) {
          return;
        }

        // Append Parent Service
        let parentBillingServiceItem = createObject(BillingServiceItem, {
          id: Guid.newGuid().toString(),
          azureDescription: parentService.azureDescription || parentService.billingDescription,
          billingDescription: parentService.billingDescription,
          discountPercent: parentService.discountPercent,
          gstExclusiveChargeDollars: parentService.gstExclusiveChargeDollars,
          hasMetMinimumCommitment: parentService.hasMetMinimumCommitment,
          initialDomain: parentService.tenant?.initialDomain,
          installedQuantity: parentService.installedQuantity,
          isProjection: billingGroup.isProjection,
          macquarieBillMonth: this.datePipe.transform(
            getDateOnly(billingGroup.macquarieBillMonth),
            'shortMonthYear') + (billingGroup.isProjection ? '*' : ''),
          microsoftChargeMonth: this.datePipe.transform(
            getDateOnly(billingGroup.microsoftChargeMonth),
            'shortMonthYear') + (billingGroup.isProjection ? '*' : ''),
          markupPercent: parentService.markupPercent,
          microsoftIdentifier: parentService.microsoftId,
          minimumCommitmentDollars: parentService.minimumCommitmentDollars,
          primaryDomain: parentService.tenant?.primaryDomain,
          productType: parentService.productType,
          serviceId: parentService.serviceId,
          tenantName: parentService.tenant?.name,
          sortDate: getDateOnly(billingGroup.microsoftChargeMonth),
          timestamp: getTimestamp(billingGroup.microsoftChargeMonth),
          usdPerUnit: billingGroup.usdPerUnit,
          minimumCommitmentUsers: parentService.minimumCommitmentUsers,
          userQuantity: parentService.userQuantity,
          chargePerUserDollars: parentService.chargePerUserDollars,
          plan: parentService.plan,
          linkedConsumptionService: parentService.linkedConsumptionService,
          billingFrequency: parentService.billingFrequency,
          termDuration: parentService.termDuration,
          markupFeeDollars: parentService.markupFeeDollars,
          rrpCostDollars: parentService.rrpCostDollars
        });
        if (!filterPred || filterPred(parentBillingServiceItem)) {
          billingServiceItems.push(parentBillingServiceItem);
        }

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          if ((isNullOrUndefined(childService.productType) ||
            (!billingKnownProductTypes.some(
              billingKnownProductType => billingKnownProductType.key.includes(childService.productType.toUpperCase()))))) {
            return;
          }

          let childBillingServiceItem = createObject(BillingServiceItem, {
            id: Guid.newGuid().toString(),
            azureDescription: childService.azureDescription || childService.billingDescription,
            billingDescription: childService.billingDescription,
            discountPercent: childService.discountPercent,
            gstExclusiveChargeDollars: childService.gstExclusiveChargeDollars,
            hasMetMinimumCommitment: childService.hasMetMinimumCommitment,
            initialDomain: childService.tenant?.initialDomain,
            installedQuantity: childService.installedQuantity,
            isProjection: billingGroup.isProjection,
            macquarieBillMonth: this.datePipe.transform(
              getDateOnly(billingGroup.macquarieBillMonth),
              'shortMonthYear') + (billingGroup.isProjection ? '*' : ''),
            microsoftChargeMonth: this.datePipe.transform(
              getDateOnly(billingGroup.microsoftChargeMonth),
              'shortMonthYear') + (billingGroup.isProjection ? '*' : ''),
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
            usdPerUnit: billingGroup.usdPerUnit,
            minimumCommitmentUsers: childService.minimumCommitmentUsers,
            userQuantity: childService.userQuantity,
            chargePerUserDollars: childService.chargePerUserDollars,
            plan: childService.plan,
            linkedConsumptionService: childService.linkedConsumptionService,
            billingFrequency: parentService.billingFrequency,
            termDuration: parentService.termDuration,
            markupFeeDollars: childService.markupFeeDollars,
            rrpCostDollars: childService.rrpCostDollars
          });
          if (!filterPred || filterPred(childBillingServiceItem)) {
            billingServiceItems.push(childBillingServiceItem);
          }
        });
      });
    });
    return billingServiceItems;
  }

  private _createChartItems(services: BillingServiceItem[]): ChartItem[] {
    if (isNullOrEmpty(services)) { return []; }

    services?.sort((first, second) =>
      compareDates(first.sortDate, second.sortDate)
    );

    let chartItems = new Array<ChartItem>();
    services.forEach(billingService => {
      if (isNullOrEmpty(billingService)) { return; }
      chartItems.push(this.mapToChartItem(billingService));
    });
    return this.reportingService.fillMissingChartItems(chartItems);
  }

  private _createSeriesItems(chartItems: ChartItem[], services: BillingServiceItem[]): BillingServiceItem[][] {
    // Group them first by their service names
    let billingSeriesItems: BillingServiceItem[][] = [];

    let seriesIndex = 0;
    let billingSeriesMap = new Map<string, ChartItem[]>();
    chartItems?.forEach(chartItem => {
      let serviceFound = services.find(service => service.id === chartItem.id);

      let chartItemsFound = billingSeriesMap.get(chartItem.name);
      if (!isNullOrEmpty(chartItemsFound)) {
        let arrayKeys = [...billingSeriesMap.keys()];
        let mapIndex = 0;

        for (const key of arrayKeys) {
          if (key === chartItem.name) { break; }
          ++mapIndex;
        }

        billingSeriesItems[mapIndex][chartItemsFound.length] = serviceFound;
        chartItemsFound.push(chartItem);
        return;
      }

      let chartItemList = new Array<ChartItem>();
      chartItemList.push(chartItem);
      billingSeriesMap.set(chartItem.name, chartItemList);

      // Initialize billing series multi array, we always set the pointindex 0 here
      billingSeriesItems[seriesIndex] = [];
      billingSeriesItems[seriesIndex][0] = serviceFound;
      seriesIndex++;
    });
    return billingSeriesItems;
  }

  private _createChartColors(chartItems: ChartItem[]): ChartColorFuncType<BillingServiceItem>[] {
    if (isNullOrEmpty(chartItems)) { return; }

    let chartNames = chartItems?.map(item => item.name) || [];

    let uniqueNames = [...new Set(chartNames)]
      .filter(name => !isNullOrUndefined(name));
    if (isNullOrEmpty(uniqueNames)) { return; }

    // Use predefined colours for each item
    // If predefined colours run out, hashes each distinct name and uses it as seed for hex colour generation
    let createdColors = uniqueNames?.map((name, nameIndex) => {
      return (nameIndex < billingColors.length) ? billingColors[nameIndex++] : hashString(name).toHex();
    });
    return createdColors.map((color, index) => itemFunc => color);
  }

  private _generateBillingTitle(billingViewModel: BillingOperationViewModel): string {
    if (isNullOrEmpty(billingViewModel)) { return ''; }

    return billingViewModel?.title;
  }

  private _generateBillingName(item: string): string {
    return this._billingNameMap.get(item);
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

    this._billingSettingsMap.set('installedQuantity', item =>
      new McsOption(
        item.installedQuantity,
        this.translate.instant('label.installedQuantity')
      )
    );

    this._billingSettingsMap.set('discountOffRrp', item =>
      new McsOption(
        item.discountPercent && this.translate.instant('label.percentage', { value: item.discountPercent }),
        this.translate.instant('label.discountOffRrp')
      )
    );

    this._billingSettingsMap.set('termDuration', item =>
      new McsOption(
        item.termDuration,
        this.translate.instant('label.termDuration')
      )
    );

    this._billingSettingsMap.set('billingFrequency', item =>
      new McsOption(
        item.billingFrequency,
        this.translate.instant('label.billingFrequency')
      )
    );

    this._billingSettingsMap.set('linkManagementService', item =>
      new McsOption(
        item.parentServiceId,
        this.translate.instant('label.linkManagementService')
      )
    );

    this._billingSettingsMap.set('minimumSpendCommitment', item =>
      new McsOption(
        this.currencyPipe.transform(item.minimumCommitmentDollars),
        this.translate.instant('label.minimumSpendCommitment')
      )
    );

    this._billingSettingsMap.set('managementCharges', item =>
      new McsOption(
        item.markupPercent && this.translate.instant('message.markupPercent', { markup: item.markupPercent }),
        this.translate.instant('label.managementCharges')
      )
    );

    this._billingSettingsMap.set('managementChargesParent', item =>
      new McsOption(
        item.markupPercentParent && this.translate.instant('message.markupPercent', { markup: item.markupPercentParent }),
        this.translate.instant('label.managementCharges')
      )
    );

    this._billingSettingsMap.set('tenantName', item =>
      new McsOption(
        item.tenantName,
        this.translate.instant('label.tenantName')
      )
    );

    this._billingSettingsMap.set('initialDomain', item =>
      new McsOption(
        item.initialDomain,
        this.translate.instant('label.initialDomain')
      )
    );

    this._billingSettingsMap.set('primaryDomain', item =>
      new McsOption(
        item.primaryDomain,
        this.translate.instant('label.primaryDomain')
      )
    );

    this._billingSettingsMap.set('microsoftIdentifier', item =>
      new McsOption(
        item.microsoftIdentifier || 'Unknown',
        this.translate.instant('label.microsoftIdentifier')
      )
    );

    this._billingSettingsMap.set('microsoftChargeMonth', item =>
      new McsOption(
        item.microsoftChargeMonth,
        this.translate.instant('label.microsoftChargeMonth')
      )
    );

    this._billingSettingsMap.set('macquarieBillMonth', item =>
      new McsOption(
        item.macquarieBillMonth,
        this.translate.instant('label.macquarieBillMonth')
      )
    );

    this._billingSettingsMap.set('serviceId', item =>
      new McsOption(
        item.serviceId,
        this.translate.instant('label.serviceId')
      )
    );

    this._billingSettingsMap.set('minimumUserCommitment', item =>
      new McsOption(
        item.minimumCommitmentUsers,
        this.translate.instant('label.minimumUserCommitment')
      )
    );

    this._billingSettingsMap.set('userQuantity', item =>
      new McsOption(
        item.userQuantity,
        this.translate.instant('label.users')
      )
    );

    this._billingSettingsMap.set('chargePerUserDollars', item =>
      new McsOption(
        this.currencyPipe.transform(item.chargePerUserDollars),
        this.translate.instant('label.chargePerUser')
      )
    );

    this._billingSettingsMap.set('plan', item =>
      new McsOption(
        item.plan,
        this.translate.instant('label.plan')
      )
    );

    this._billingSettingsMap.set('linkedConsumptionService', item =>
      new McsOption(
        item.linkedConsumptionService,
        this.translate.instant('label.linkedConsumptionService')
      )
    );

    this._billingSettingsMap.set('rrp', item =>
      new McsOption(
        this.currencyPipe.transform(item.rrpCostDollars),
        this.translate.instant('label.rrpCostDollars')
      )
    );

    this._billingSettingsMap.set('serviceSpecificManagementCharges', item =>
      new McsOption(
        item.markupPercent && this.translate.instant('label.percentage', { value: item.markupPercent }),
        this.translate.instant('label.serviceSpecificManagementCharges')
      )
    );

    this._billingSettingsMap.set('actualServiceSpecificManagementFee', item =>
      new McsOption(
        this.currencyPipe.transform(item.markupFeeDollars),
        this.translate.instant('label.actualServiceSpecificManagementFee')
      )
    );
  }

  private _registerBillingStructMap(): void {

    // create view model for each known billing product type
    billingKnownProductTypes.forEach((billingKnownProductType) => {
      this._billingStructMap.set(billingKnownProductType.key,
        item => new BillingOperationViewModel(
          ((billingKnownProductType.detailUseAzureDescription) ? item.azureDescription : item.billingDescription) + ` - ` + item.serviceId,
          this._getTooltipOptionsInfo(item, ...billingKnownProductType.detailCustomTooltipFields),
          billingKnownProductType.detailIncludeMinimumCommentNote,
          (item.isProjection) ? item.isProjection : false
        )
      );
    });
  }

  private _registerBillingNameMap(): void {
    billingKnownProductTypes.forEach((billingKnownProductType) => {
      this._billingNameMap.set(billingKnownProductType.key, billingKnownProductType.friendlyName);
    });
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
}
