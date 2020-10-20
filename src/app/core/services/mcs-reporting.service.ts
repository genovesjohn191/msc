import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsReportGenericItem, McsReportIntegerData, McsReportSubscription } from '@app/models';
import { McsApiService } from '@app/services';
import { ChartItem } from '@app/shared/chart';

@Injectable()
export class McsReportingService {

  constructor(private _apiService: McsApiService) { }

  public getSubscriptions(): Observable<McsReportSubscription[]> {
    return this._apiService.getSubscriptions()
      .pipe(map((resources) => resources.collection));
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
      .pipe(map((resources) => this._convertIntegerDataToChartItem(resources.collection)));
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
