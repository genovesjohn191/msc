import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsReportGenericItem } from '@app/models';
import { McsApiService } from '@app/services';
import { ChartItem } from '@app/shared/chart';

@Injectable()
export class McsReportingService {

  constructor(private _apiService: McsApiService) { }

  public getServicesCostOverviewReport(
    startPeriod: string = '',
    endPeriod: string = ''): Observable<ChartItem[]> {
    return this._apiService.getServicesCostOverviewReport(startPeriod, endPeriod)
      .pipe(map((resources) => this._convertToChartItem(resources.collection)));
  }

  public getVirtualMachineBreakdownReport(
    startPeriod: string = '',
    endPeriod: string = ''): Observable<ChartItem[]> {
    return this._apiService.getVirtualMachineBreakdownReport(startPeriod, endPeriod)
      .pipe(map((resources) => this._convertToChartItem(resources.collection)));
  }

  public getPerformanceReport(
    startPeriod: string = '',
    endPeriod: string = ''): Observable<ChartItem[]> {
    return this._apiService.getPerformanceReport(startPeriod, endPeriod)
      .pipe(map((resources) => this._convertToChartItem(resources.collection)));
  }

  private _convertToChartItem(items: McsReportGenericItem[]): ChartItem[] {
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
