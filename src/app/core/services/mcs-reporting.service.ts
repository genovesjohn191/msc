import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsQueryParam,
  McsReportCostRecommendations,
  McsReportGenericItem,
  McsReportIntegerData,
  McsReportServiceChangeInfo,
  McsReportSubscription,
  McsReportVMRightsizing,
  McsReportVMRightsizingSummary,
  McsReportOperationalSavings,
  McsReportResourceHealth
} from '@app/models';
import { McsApiService } from '@app/services';
import { ChartItem } from '@app/shared/chart';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsReportingService {

  public get azureSubscriptionCount(): Observable<number> {
    return this._apiService.getSubscriptions()
      .pipe(map((resources) => resources.totalCollectionCount));
  }

  public get licenseSubscriptionCount(): Observable<number> {
    return this._apiService.getLicenses()
      .pipe(map((resources) => resources.totalCollectionCount));
  }

  constructor(private _apiService: McsApiService) { }

  public getSubscriptions(): Observable<McsReportSubscription[]> {
    return this._apiService.getSubscriptions()
      .pipe(map((resources) => {
        return resources.collection;
      }));
  }

  public getServicesCostOverviewReport(
    startPeriod: string = '',
    endPeriod: string = '',
    subscriptionIds: string[] = []): Observable<ChartItem[]> {
    return this._apiService.getServicesCostOverviewReport(startPeriod, endPeriod, subscriptionIds)
      .pipe(map((resources) => this._convertGenericItemToChartItem(resources.collection)));
  }

  public getResourceMonthlyCostReport(
    startPeriod: string = '',
    endPeriod: string = '',
    subscriptionIds: string[] = []): Observable<ChartItem[]> {
    return this._apiService.getResourceMonthlyCostReport(startPeriod, endPeriod, subscriptionIds)
      .pipe(map((resources) => this._convertGenericItemToChartItem(resources.collection)));
  }

  public getVirtualMachineBreakdownReport(
    startPeriod: string = '',
    endPeriod: string = '',
    subscriptionIds: string[] = []): Observable<ChartItem[]> {
    return this._apiService.getVirtualMachineBreakdownReport(startPeriod, endPeriod, subscriptionIds)
      .pipe(map((resources) => this._convertGenericItemToChartItem(resources.collection)));
  }

  public getPerformanceReport(
    startPeriod: string = '',
    endPeriod: string = '',
    subscriptionIds: string[] = []): Observable<ChartItem[]> {
    return this._apiService.getPerformanceReport(startPeriod, endPeriod, subscriptionIds)
      .pipe(map((resources) => this._convertGenericItemToChartItem(resources.collection)));
  }

  public getAzureServicesReport(): Observable<ChartItem[]> {
    return this._apiService.getAzureResourcesReport()
      .pipe(map((resources) => {
        let items: McsReportIntegerData[] = [];
        if (!isNullOrEmpty(resources.collection)) {
          items = resources.collection.sort((a, b) => b.value - a.value);
        }
        return this._convertIntegerDataToChartItem(items);
      }));
  }

  public getCostRecommendations(): Observable<McsReportCostRecommendations> {
    return this._apiService.getCostRecommendations();
  }

  public getServiceChanges(): Observable<ChartItem[]> {
    return this._apiService.getServiceChanges()
      .pipe(map((resources) => {
        let items: McsReportServiceChangeInfo[] = [];
        if (!isNullOrEmpty(resources.collection)) {
          items = resources.collection.sort((a, b) => b.serviceCountChange - a.serviceCountChange);
        }
        return this._convertServiceChangeInfoToChartItem(items);
      }));
  }

  public getOperationalMonthlySavings(): Observable<McsReportOperationalSavings[]> {
    return this._apiService.getOperationalMonthlySavings();
  }

  public getVMRightsizing(query?: McsQueryParam): Observable<McsReportVMRightsizing[]> {
    return this._apiService.getVMRightsizing();
  }

  public getVMRightsizingSummary(): Observable<McsReportVMRightsizingSummary> {
    return this._apiService.getVMRightsizingSummary();
  }

  public getResourceHealth(): Observable<McsReportResourceHealth> {
    return this._apiService.getResourceHealth();
  }

  private _convertServiceChangeInfoToChartItem(items: McsReportServiceChangeInfo[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.serviceName) || isNullOrEmpty(item.serviceCountChange);
      if (invalidData) { return; }
      data.push({
        name: 'Change',
        xValue: `${item.serviceName}|${item.serviceCostChange}`,
        yValue: item.serviceCountChange
      });
    });

    return data;
  }

  private _convertIntegerDataToChartItem(items: McsReportIntegerData[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.name) || isNullOrEmpty(item.value);
      if (invalidData) { return; }
      data.push({
        name: '',
        xValue: item.name,
        yValue: item.value
      });
    });

    return data;
  }

  private _convertGenericItemToChartItem(items: McsReportGenericItem[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.name) || isNullOrEmpty(item.value) || isNullOrEmpty(item.period);
      if (invalidData) { return; }
      data.push({
        name: item.name,
        xValue: item.period,
        yValue: item.value
      });
    });

    return data;
  }
}
