import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injector } from '@angular/core';
import { McsDateTimeFormat } from '@app/core';
import {
  McsOption,
  McsReportBillingAvdDailyAverageUser
} from '@app/models';
import { ChartItem } from '@app/shared';
import {
  compareDates,
  getDateOnly,
  isNullOrEmpty,
  Guid
} from '@app/utilities';

import { BillingOperationBase } from '../abstractions/billing-operation.base';
import { IBillingOperation } from '../abstractions/billing-operation.interface';
import {
  BillingOperationData,
  BillingOperationViewModel
} from '../models';

export class BillingAvdDailyUserAverageItem {
  public id: string;
  public microsoftChargeMonth: Date;
  public macquarieBillMonth: Date;
  public date: Date;
  public serviceId: string = undefined;
  public billingDescription: string = undefined;
  public azureDescription: string = undefined;
  public productType: string = undefined;
  public averageUsers: number = undefined;
  public averageConnections: number = undefined;
  public minimumCommitmentUsers: number = undefined;
  public plan: string = undefined;
  public tenantName: string;
  public tenantInitialDomain: string;
  public tenantPrimaryDomain: string;
  public microsoftId: string = undefined;
}

export class BillingAvdDailyUserAverageOperation
  extends BillingOperationBase<BillingAvdDailyUserAverageItem>
  implements IBillingOperation<McsReportBillingAvdDailyAverageUser, BillingAvdDailyUserAverageItem> {

  private _dataChange = new BehaviorSubject<BillingOperationData<BillingAvdDailyUserAverageItem>>(null);
  private _dataApiChange = new BehaviorSubject<McsReportBillingAvdDailyAverageUser[]>(null);

  constructor(injector: Injector) {
    super(injector);
  }

  public initializeData(apiRecords: McsReportBillingAvdDailyAverageUser[]): void {
    this._dataApiChange.next(apiRecords);
    this._initializeDataByDataGroup();
  }

  public getOperationData(): BillingOperationData<BillingAvdDailyUserAverageItem> {
    return this._dataChange.getValue();
  }

  public operationDataChange(): Observable<BillingOperationData<BillingAvdDailyUserAverageItem>> {
    return this._dataChange.asObservable();
  }

  public filterOperationData(filterPred: (item: BillingAvdDailyUserAverageItem) => boolean): void {
    this._initializeDataByDataGroup(filterPred);
  }

  public reset(): void {
    this._initializeDataByDataGroup();
  }

  protected mapToChartItem(item: BillingAvdDailyUserAverageItem): ChartItem {
    let currentYear = new Date().getFullYear();
    let dateFormat = item.microsoftChargeMonth.getFullYear() === currentYear ? 'fullMonth' : 'shortMonthYear';

    let chartItem = {
      id: item.id,
      name: item.serviceId,
      xValue: this.datePipe.transform(item.microsoftChargeMonth, this._friendlyFormatDate(item.microsoftChargeMonth)),
      yValue: item.averageUsers
    } as ChartItem;
    return chartItem;
  }

  private _initializeDataByDataGroup(filterPred?: (item: BillingAvdDailyUserAverageItem) => boolean): void {
    this._generateBillingOperationData(filterPred);
  }

  private _generateBillingOperationData(filterPred: (item: BillingAvdDailyUserAverageItem) => boolean): void {
    let dataOperation = new BillingOperationData<BillingAvdDailyUserAverageItem>();
    dataOperation.summaryItems = this._flattenSummaryItems(filterPred);
    dataOperation.chartItems = this.buildChartItems(
      dataOperation.summaryItems, (first, second) =>
      compareDates(first.microsoftChargeMonth, second.microsoftChargeMonth)
    );
    dataOperation.seriesItems = this.buildSeriesItems(
      dataOperation.chartItems,
      dataOperation.summaryItems,
      (service, chart) => service.id === chart.id
    );
    dataOperation.chartColors = this.buildChartColors(dataOperation.chartItems);
    dataOperation.getViewModelFunc = this._viewModelFunc.bind(this);
    dataOperation.getTitleFunc = item => item?.title;

    this._dataChange.next(dataOperation);
  }

  private _flattenSummaryItems(filterPred?: (item: BillingAvdDailyUserAverageItem) => boolean): BillingAvdDailyUserAverageItem[] {
    let apiRecords = this._dataApiChange.getValue();
    if (isNullOrEmpty(apiRecords)) { return null; }

    let convertedItems = new Array<BillingAvdDailyUserAverageItem>();

    apiRecords.forEach(record => {
      if (isNullOrEmpty(record)) { return; }

      record.services.forEach(service => {
        let convertedItem = new BillingAvdDailyUserAverageItem();
        convertedItem = Object.assign(convertedItem, service);
        convertedItem.id = Guid.newGuid().toString();
        convertedItem.microsoftChargeMonth = record.microsoftChargeMonth;
        convertedItem.macquarieBillMonth = record.macquarieBillMonth;
        //todo: check the below one before committing
        convertedItem.date = record.date;
        convertedItem.tenantName = service.tenant?.name;
        convertedItem.tenantInitialDomain = service.tenant?.initialDomain;
        convertedItem.tenantPrimaryDomain = service.tenant?.primaryDomain;
        convertedItem.microsoftId = service.microsoftId;
        convertedItems.push(convertedItem);
      });
    });
    return convertedItems;
  }

  private _viewModelFunc(item: BillingAvdDailyUserAverageItem): BillingOperationViewModel {
    return new BillingOperationViewModel(
      `${item.billingDescription} - ${item.serviceId}`,
      [
        new McsOption(item.averageUsers, 'Average Users'),
        new McsOption(item.minimumCommitmentUsers, 'Minimum User Commitment'),
        new McsOption(item.plan, 'Plan'),
        new McsOption(item.tenantName, 'Tenant Name'),
        new McsOption(item.tenantInitialDomain, 'Initial Domain'),
        new McsOption(item.tenantPrimaryDomain, 'Primary Domain'),
        new McsOption(item.microsoftId, 'Microsoft Identifier'),
        new McsOption(this.datePipe.transform(item.microsoftChargeMonth, this._friendlyFormatDate(item.microsoftChargeMonth)), 'Microsoft Charge Month'),
        new McsOption(this.datePipe.transform(item.macquarieBillMonth, this._friendlyFormatDate(item.macquarieBillMonth)), 'Macquarie Bill Month'),
        new McsOption(item.serviceId, 'Service ID')
      ],
      false
    );
  }

  private _friendlyFormatDate(date): McsDateTimeFormat  {
    let currentYear = new Date().getFullYear();
    let formattedDate = date.getFullYear() === currentYear ? 'fullMonth' : 'shortMonthYear';

    return formattedDate as McsDateTimeFormat;
  }
}
