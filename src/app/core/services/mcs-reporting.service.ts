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
  McsReportResourceHealth,
  McsReportSecurityScore,
  McsReportSeverityAlerts,
  McsReportMonitoringAndAlerting,
  McsReportResourceCompliance,
  McsRightSizingQueryParams,
  McsReportManagementService,
  McsReportUpdateManagement
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

  public getManagementServices(isEssentials?: boolean): Observable<McsReportManagementService[]> {
    return this._apiService.getManagementServices(isEssentials)
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
      .pipe(map((resources) => this._convertGenericItemToChartItemNoMonth(resources.collection)));
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
    subscriptionIds: string = ''): Observable<ChartItem[]> {
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

  public getOperationalMonthlySavings(): Observable<McsReportOperationalSavings> {
    return this._apiService.getOperationalMonthlySavings();
  }

  public getVMRightsizing(query?: McsRightSizingQueryParams): Observable<McsReportVMRightsizing[]> {
    return this._apiService.getVMRightsizing(query);
  }

  public getVMRightsizingSummary(): Observable<McsReportVMRightsizingSummary> {
    return this._apiService.getVMRightsizingSummary();
  }

  public getResourceHealth(): Observable<McsReportResourceHealth> {
    return this._apiService.getResourceHealth();
  }

  public getSecurityScore(): Observable<McsReportSecurityScore> {
    return this._apiService.getSecurityScore();
  }

  public getResourceCompliance(
    period: string = '',
    subscriptionIds?: string[]
  ): Observable<McsReportResourceCompliance> {
    return this._apiService.getResourceCompliance(period, subscriptionIds);
  }

  public getMonitoringAndAlerting(
    period?: string,
    subscriptionIds?: string[]
  ): Observable<McsReportMonitoringAndAlerting> {
    return this._apiService.getMonitoringAndAlerting(period, subscriptionIds)
    .pipe(map((resources) => {
      let items: ChartItem[] = [];
      let alerts: McsReportSeverityAlerts[] = [];
      if (!isNullOrEmpty(resources.alerts)) {
        alerts = resources.alerts.sort((a, b) => a.severity - b.severity);
      }
      items = this._convertMonitoringAndAlertingToChartItem(alerts);
      return {
        startedOn: resources.startedOn,
        totalAlerts: resources.totalAlerts,
        alerts: resources.alerts,
        alertsChartItem: items
      };
    }));
  }

  public getUpdateManagement(period?: string): Observable<McsReportUpdateManagement[]> {
    return this._apiService.getUpdateManagement(period);
  }

  public _convertServiceChangeInfoToChartItem(items: McsReportServiceChangeInfo[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.serviceName) || isNullOrEmpty(item.serviceCountChange);
      if (invalidData) { return; }
      data.push({
        name: 'Change',
        xValue: item.serviceName,
        yValue: item.serviceCountChange
      });
    });

    return data;
  }

  public _convertMonitoringAndAlertingToChartItem(items: McsReportSeverityAlerts[]): ChartItem[] {
    let data: ChartItem[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.description);
      if (invalidData) { return; }
      data.push({
        name: '',
        xValue: `Sev ${item.severity}`,
        yValue: item.totalAlerts
      });
    });

    return data;
  }

  public _convertIntegerDataToChartItem(items: McsReportIntegerData[]): ChartItem[] {
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

  public _convertGenericItemToChartItem(items: McsReportGenericItem[]): ChartItem[] {
    let data: ChartItem[] = [];
    items = this.fillMissingRecordsWithDefault(items);
    items.forEach(item => {
      data.push({
        name: item.name,
        xValue: item.period,
        yValue: item.value
      });
    });

    return data;
  }

  public _convertGenericItemToChartItemNoMonth(items: McsReportGenericItem[]): ChartItem[] {
    let data: ChartItem[] = [];
    items = this.fillMissingRecordsWithDefault(items);
    items.forEach(item => {
      let period = item.period.replace(/[a-zA-z ]/g, '');
      data.push({
        name: item.name,
        xValue: period,
        yValue: item.value
      });
    });

    return data;
  }

  public fillMissingRecordsWithDefault(items: McsReportGenericItem[], defaultValue: number = 0): McsReportGenericItem[] {
    let newPeriods: string[] = [];
    let newNames: string[] = [];
    let newData: McsReportGenericItem[] = [];

    // Break periods and names to separate array and ensure uniqueness
    items.forEach((data) => {
      let invalidData = isNullOrEmpty(data.name) || isNullOrEmpty(data.period);
      if (invalidData) { return; }

      let newPeriodList = newPeriods.findIndex((period) => period === data.period) < 0;
      if (newPeriodList) { newPeriods.push(data.period) };

      let newNameList = newNames.findIndex((name) => name === data.name) < 0;
      if (newNameList) { newNames.push(data.name) };
    });

    newPeriods.forEach((newPeriod) => {
      newNames.forEach((newName) => {
        let item = items.find((data) => data.period === newPeriod && data.name === newName);
        newData.push({
          period: newPeriod,
          name: newName,
          value: (item && item.value) || defaultValue
        });
      })
    })

    return newData;
  }
}
