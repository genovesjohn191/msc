import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsReportCostRecommendations, McsReportGenericItem, McsReportIntegerData, McsReportSubscription } from '@app/models';
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

  private _convertIntegerDataToChartItem(items: McsReportIntegerData[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
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
        data.push({
          name: item.name,
          xValue: item.period,
          yValue: item.value
        });
    });

    return data;
  }
}
