import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsQueryParam,
  McsReportDefenderCloudAlerts,
  McsReportAuditAlerts,
  McsReportRecentServiceRequestSlt,
  McsReportComputeResourceTotals,
  McsReportCostRecommendations,
  McsReportGenericItem,
  McsReportInefficientVms,
  McsReportIntegerData,
  McsReportManagementService,
  McsReportMonitoringAndAlerting,
  McsReportOperationalSavings,
  McsReportParams,
  McsReportPlatformSecurityAdvisories,
  McsReportResourceCompliance,
  McsReportResourceHealth,
  McsReportSecurityScore,
  McsReportServiceChangeInfo,
  McsReportSeverityAlerts,
  McsReportStorageResourceUtilisation,
  McsReportSubscription,
  McsReportTopVmsByCost,
  McsReportUpdateManagement,
  McsReportVMRightsizing,
  McsReportVMRightsizingSummary,
  McsRightSizingQueryParams,
  McsReportUpdateManagementParams,
  McsReportInefficientVmParams,
  McsPlannedWork,
  McsPlannedWorkQueryParams
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

  public getVMRightsizing(query?: McsReportParams): Observable<McsReportVMRightsizing[]> {
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
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]
  ): Observable<McsReportMonitoringAndAlerting> {
    return this._apiService.getMonitoringAndAlerting(periodStart, periodEnd, subscriptionIds)
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

  public getUpdateManagement(query?: McsReportUpdateManagementParams): Observable<McsReportUpdateManagement[]> {
    return this._apiService.getUpdateManagement(query);
  }

  public getDefenderCloudAlerts(
    periodStart?: string,
    periodEnd?: string): Observable<McsReportDefenderCloudAlerts[]> {
    return this._apiService.getDefenderCloudAlerts(periodStart, periodEnd);
  }

  public getAuditAlerts(query?: McsReportParams): Observable<McsReportAuditAlerts[]> {
    return this._apiService.getAuditAlerts(query);
  }

  public getInefficientVms(query?: McsReportInefficientVmParams): Observable<McsReportInefficientVms[]> {
    return this._apiService.getInefficientVms(query);
  }

  public getTopVmsByCost(query?: McsQueryParam): Observable<McsReportTopVmsByCost[]> {
    return this._apiService.getTopVmsByCost(query);
  }

  public getPlatformSecurityAdvisories(query?: McsReportParams): Observable<McsReportPlatformSecurityAdvisories[]> {
    return this._apiService.getPlatformSecurityAdvisories(query);
  }

  public getRecentServiceRequestSlt(query?: McsQueryParam): Observable<McsReportRecentServiceRequestSlt[]> {
    return this._apiService.getRecentServiceRequestSlt(query);
  }

  public getComputeResourceTotals(): Observable<McsReportComputeResourceTotals> {
    return this._apiService.getComputeResourceTotals();
  }

  public getResourcesStorages(): Observable<McsReportStorageResourceUtilisation[]> {
    return this._apiService.getResourcesStorages();
  }

  public getPlannedWorks(query?: McsPlannedWorkQueryParams): Observable<McsPlannedWork[]> {
    return this._apiService.getPlannedWork(query)
      .pipe(map((resources) => {
        return resources.collection;
      }));
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

  public fillMissingChartItems(chartItems: ChartItem[], defaultValue: number = 0): ChartItem[] {
    if (isNullOrEmpty(chartItems)) { return; }

    // Get all periods
    let uniquePeriods = [...new Set(chartItems?.map(item => item.xValue))];
    let uniqueNames = [...new Set(chartItems?.map(item => item.name))];
    let chartItemMap = new Map<string, ChartItem[]>();

    // Group records by x-axis
    uniquePeriods?.forEach(period => {
      let periodItems: ChartItem[];
      let periodFound = chartItemMap.get(period);
      if (isNullOrEmpty(periodFound)) { periodItems = []; }

      uniqueNames.forEach(uniqueName => {
        let itemFound = periodItems.find(item => item.name === uniqueName);
        if (!isNullOrEmpty(itemFound)) { return; }

        let chartItemFound = chartItems.find(chartItem =>
          chartItem.name === uniqueName &&
          chartItem.xValue === period
        );
        let normalizedValue = chartItemFound?.yValue || defaultValue;

        periodItems.push({
          id: chartItemFound?.id,
          name: uniqueName,
          xValue: period,
          yValue: normalizedValue
        });
      });
      chartItemMap.set(period, periodItems);
    });

    // Create flat records
    let updatedChartItems = new Array<ChartItem>();
    chartItemMap.forEach(mapRecords => {
      updatedChartItems.push(...mapRecords);
    });
    return updatedChartItems;
  }

  public fillMissingRecordsWithDefault(items: McsReportGenericItem[], defaultValue: number = 0): McsReportGenericItem[] {
    let newPeriods: string[] = [];
    let newNames: string[] = [];
    let newData: McsReportGenericItem[] = [];

    // Break periods and names to separate array and ensure uniqueness
    items.forEach((data) => {
      let invalidData = isNullOrEmpty(data.name) || isNullOrEmpty(data.period) || isNullOrEmpty(data.value);
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
