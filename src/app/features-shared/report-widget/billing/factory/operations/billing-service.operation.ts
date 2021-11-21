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
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  Guid
} from '@app/utilities';

import {
  BillingOperationBase,
  PROJECT_TEXT
} from '../abstractions/billing-operation.base';
import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { BillingOperationData } from '../models/billing-operation-data';
import { BillingOperationViewModel } from '../models/billing-operation-viewmodel';
import { BillingServiceItem } from '../models/billing-service-item';

export class BillingServiceOperation
  extends BillingOperationBase
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

  private _initializeDataByDataGroup(filterPred?: (item: BillingServiceItem) => boolean): void {
    this._generateBillingOperationData(filterPred);
  }

  private _generateBillingOperationData(filterPred: (item: BillingServiceItem) => boolean): void {
    let dataOperation = new BillingOperationData<BillingServiceItem>();
    dataOperation.summaryItems = this._createBillingSummaries(filterPred);
    dataOperation.chartItems = this._createChartItems(dataOperation.summaryItems);
    dataOperation.seriesItems = this._createSeriesItems(dataOperation.chartItems, dataOperation.summaryItems);
    dataOperation.chartColors = this._createChartColors(dataOperation.chartItems, dataOperation.seriesItems);
    dataOperation.getViewModelFunc = this._getBillingViewModelByItem.bind(this);
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
        // Append Parent Service
        let parentBillingServiceItem = createObject(BillingServiceItem, {
          id: Guid.newGuid().toString(),
          azureDescription: parentService.azureDescription || parentService.billingDescription,
          billingDescription: parentService.billingDescription,
          discountPercent: parentService.discountPercent,
          finalChargeDollars: parentService.finalChargeDollars,
          hasMetMinimumCommitment: parentService.hasMetMinimumCommitment,
          initialDomain: parentService.tenant?.initialDomain,
          installedQuantity: parentService.installedQuantity,
          isProjection: billingGroup.isProjection,
          macquarieBillMonth: this.datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
          microsoftChargeMonth: this.datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
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
        if (!filterPred || filterPred(parentBillingServiceItem)) {
          billingServiceItems.push(parentBillingServiceItem);
        }

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          let childBillingServiceItem = createObject(BillingServiceItem, {
            id: Guid.newGuid().toString(),
            azureDescription: childService.azureDescription || childService.billingDescription,
            billingDescription: childService.billingDescription,
            discountPercent: childService.discountPercent,
            finalChargeDollars: childService.finalChargeDollars,
            hasMetMinimumCommitment: childService.hasMetMinimumCommitment,
            initialDomain: childService.tenant?.initialDomain,
            installedQuantity: childService.installedQuantity,
            isProjection: billingGroup.isProjection,
            macquarieBillMonth: this.datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
            microsoftChargeMonth: this.datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
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

      let billingViewModel = this._getBillingViewModelByItem(billingService);
      let billingTitle = this._generateBillingTitle(billingViewModel);
      let chartItem = {
        id: billingService.id,
        name: billingTitle,
        xValue: billingService.microsoftChargeMonth,
        yValue: billingService.finalChargeDollars
      } as ChartItem;

      chartItems.push(chartItem);
    });
    return this.reportingService.fillMissingChartItems(chartItems);
  }

  private _createSeriesItems(
    chartItems: ChartItem[],
    services: BillingServiceItem[]
  ): BillingServiceItem[][] {
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

  private _createChartColors(
    chartItems: ChartItem[],
    seriesItems: BillingServiceItem[][]
  ): ChartColorFuncType<BillingServiceItem>[] {
    if (isNullOrEmpty(chartItems)) { return; }

    let chartNames = chartItems?.map(item => item.name) || [];

    let uniqueNames = [...new Set(chartNames)];
    let createdColors = uniqueNames.map(name => name.toHex());
    let colorsFunc = createdColors.map((color, index) =>
      itemFunc => this._colorFunc(itemFunc, color, index, seriesItems));

    return colorsFunc;
  }

  private _colorFunc(
    opts: any,
    definedColor: string,
    index: number,
    seriesItems: BillingServiceItem[][]
  ): string {
    if (isNullOrEmpty(seriesItems)) { return definedColor; }

    let serviceFound = seriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(serviceFound)) { return definedColor; }

    let billingStruct = this._getBillingViewModelByItem(serviceFound);
    let billingTitle = this._generateBillingTitle(billingStruct);
    return billingTitle?.includes(PROJECT_TEXT) ? definedColor.toDefinedGreyHex(index) : definedColor;
  }

  private _getBillingViewModelByItem(service: BillingServiceItem): BillingOperationViewModel {
    if (isNullOrEmpty(service)) { return null; }

    let billingKey = removeSpaces(service?.productType)?.toUpperCase();
    let billingFuncFound = this._billingStructMap?.get(billingKey);
    if (isNullOrEmpty(billingFuncFound)) { return null; }

    return billingFuncFound(service);
  }

  private _generateBillingTitle(billingViewModel: BillingOperationViewModel): string {
    if (isNullOrEmpty(billingViewModel)) { return null; }

    return billingViewModel?.includeProjectionSuffix ?
      `${billingViewModel.title} ${PROJECT_TEXT}` : billingViewModel?.title;
  }

  private _generateBillingName(item: string): string {
    return this._billingNameMap.get(item);
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
  }

  private _registerBillingStructMap(): void {
    this._billingStructMap.set('CSPLICENSES',
      item => new BillingOperationViewModel(
        `${item.azureDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, false
      )
    );

    this._billingStructMap.set('AZURESOFTWARESUBSCRIPTION',
      item => new BillingOperationViewModel(
        `${item.azureDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, false
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSCSP',
      item => new BillingOperationViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZURECSP',
      item => new BillingOperationViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('MANAGEDAZUREENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `${item.billingDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'minimumSpendCommitment', 'managementCharges',
          'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        true, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTION',
      item => new BillingOperationViewModel(
        `${item.azureDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'usdPerUnit', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
      item => new BillingOperationViewModel(
        `${item.azureDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );

    this._billingStructMap.set('AZURERESERVATION',
      item => new BillingOperationViewModel(
        `${item.azureDescription} - ${item.serviceId}`,
        this._getTooltipOptionsInfo(item,
          'total', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
          'managementChargesParent', 'tenantName', 'initialDomain', 'primaryDomain',
          'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'),
        false, item.isProjection
      )
    );
  }

  private _registerBillingNameMap(): void {
    this._billingNameMap.set('AZUREESSENTIALSCSP', `Azure Essentials CSP`);
    this._billingNameMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT', `Azure Essentials Enterprise Agreement`);
    this._billingNameMap.set('MANAGEDAZURECSP', `Managed Azure CSP`);
    this._billingNameMap.set('MANAGEDAZUREENTERPRISEAGREEMENT', `Managed Azure Enterprise Agreement`);
    this._billingNameMap.set('CSPLICENSES', `CSP Licenses`);
    this._billingNameMap.set('AZURESOFTWARESUBSCRIPTION', `Software Subscriptions`);
    this._billingNameMap.set('AZUREESSENTIALSCSP', `Azure Essentials CSP`);
    this._billingNameMap.set('AZUREESSENTIALSENTERPRISEAGREEMENT', `Azure Essentials Enterprise Agreement`);
    this._billingNameMap.set('MANAGEDAZURECSP', `Managed Azure CSP`);
    this._billingNameMap.set('MANAGEDAZUREENTERPRISEAGREEMENT', `Managed Azure Enterprise Agreement`);
    this._billingNameMap.set('AZUREPRODUCTCONSUMPTION', `Azure Product Consumption`);
    this._billingNameMap.set('AZURERESERVATION', `Azure Reservation`);
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