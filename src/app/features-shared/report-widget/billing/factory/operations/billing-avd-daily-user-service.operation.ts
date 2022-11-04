import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injector } from '@angular/core';
import {
  McsOption,
  McsReportBillingAvdDailyUser
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

export class BillingAvdDailyUserServiceItem {
  public id: string;
  public date: Date;
  public serviceId: string;
  public billingDescription: string;
  public azureDescription: string;
  public productType: string;
  public users: number;
  public connections: number;
  public plan: string;
  public tenantName: string;
  public tenantInitialDomain: string;
  public tenantPrimaryDomain: string;
  public microsoftId: string;
}

export class BillingAvdDailyUserServiceOperation
  extends BillingOperationBase<BillingAvdDailyUserServiceItem>
  implements IBillingOperation<McsReportBillingAvdDailyUser, BillingAvdDailyUserServiceItem> {

  private _dataChange = new BehaviorSubject<BillingOperationData<BillingAvdDailyUserServiceItem>>(null);
  private _dataApiChange = new BehaviorSubject<McsReportBillingAvdDailyUser[]>(null);

  constructor(injector: Injector) {
    super(injector);
  }

  public initializeData(apiRecords: McsReportBillingAvdDailyUser[]): void {
    this._dataApiChange.next(apiRecords);
    this._initializeDataByDataGroup();
  }

  public getOperationData(): BillingOperationData<BillingAvdDailyUserServiceItem> {
    return this._dataChange.getValue();
  }

  public operationDataChange(): Observable<BillingOperationData<BillingAvdDailyUserServiceItem>> {
    return this._dataChange.asObservable();
  }

  public filterOperationData(filterPred: (item: BillingAvdDailyUserServiceItem) => boolean): void {
    this._initializeDataByDataGroup(filterPred);
  }

  public reset(): void {
    this._initializeDataByDataGroup();
  }

  protected mapToChartItem(item: BillingAvdDailyUserServiceItem): ChartItem {
    let chartItem = {
      id: item.id,
      name: item.serviceId,
      xValue: this.datePipe.transform(getDateOnly(item.date), 'dayMonth'),
      yValue: item.users
    } as ChartItem;
    return chartItem;
  }

  protected viewModelFunc(item: BillingAvdDailyUserServiceItem): BillingOperationViewModel {
    return new BillingOperationViewModel(
      `${item.billingDescription}-${item.serviceId}`,
      [
        new McsOption(item.users, 'Users'),
        new McsOption(item.plan, 'Plan'),
        new McsOption(item.tenantName, 'Tenant Name'),
        new McsOption(item.tenantInitialDomain, 'Initial Domain'),
        new McsOption(item.tenantPrimaryDomain, 'Primary Domain'),
        new McsOption(item.microsoftId, 'Microsoft Identifier'),

        // TODO: Check this out, microsoft charge month and bill was not in user daily service
        // new McsOption(item.microsoftChargeMonth, 'Microsoft Charge Month'),
        // new McsOption(item.macquarieBillMonth, 'Macquarie Bill Month'),
        new McsOption(item.serviceId, 'Service ID')
      ],
      false
    );
  }

  private _initializeDataByDataGroup(filterPred?: (item: BillingAvdDailyUserServiceItem) => boolean): void {
    this._generateBillingOperationData(filterPred);
  }

  private _generateBillingOperationData(filterPred: (item: BillingAvdDailyUserServiceItem) => boolean): void {
    let dataOperation = new BillingOperationData<BillingAvdDailyUserServiceItem>();
    dataOperation.summaryItems = this._flattenSummaryItems(filterPred);
    dataOperation.chartItems = this.buildChartItems(
      dataOperation.summaryItems, (first, second) =>
      compareDates(first.date, second.date)
    );
    dataOperation.seriesItems = this.buildSeriesItems(
      dataOperation.chartItems,
      dataOperation.summaryItems,
      (service, chart) => service.id === chart.id
    );
    dataOperation.chartColors = this.buildChartColors(dataOperation.chartItems);
    dataOperation.getViewModelFunc = this.viewModelFunc.bind(this);
    dataOperation.getTitleFunc = item => item?.title;

    this._dataChange.next(dataOperation);
  }

  private _flattenSummaryItems(filterPred?: (item: BillingAvdDailyUserServiceItem) => boolean): BillingAvdDailyUserServiceItem[] {
    let apiRecords = this._dataApiChange.getValue();
    if (isNullOrEmpty(apiRecords)) { return null; }

    let convertedItems = new Array<BillingAvdDailyUserServiceItem>();

    apiRecords.forEach(record => {
      if (isNullOrEmpty(record)) { return; }

      record.services.forEach(service => {
        // TODO: Check out the specs, if we want to filter some known product types,
        // we can put it here and create a map
        let convertedItem = new BillingAvdDailyUserServiceItem();
        convertedItem = Object.assign(convertedItem, service);
        convertedItem.id = Guid.newGuid().toString();
        convertedItem.date = record.date;
        convertedItem.tenantName = service.tenant?.name;
        convertedItem.tenantInitialDomain = service.tenant?.initialDomain;
        convertedItem.tenantPrimaryDomain = service.tenant?.primaryDomain;
        convertedItem.microsoftId = service.tenant?.microsoftId;
        convertedItems.push(convertedItem);
      });
    });
    return convertedItems;
  }
}