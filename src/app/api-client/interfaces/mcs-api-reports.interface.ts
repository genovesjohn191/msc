import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
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
  McsReportMonitoringAndAlerting,
  McsReportResourceCompliance,
  McsRightSizingQueryParams
} from '@app/models';

export interface IMcsApiReportsService {
  getSubscriptions(): Observable<McsApiSuccessResponse<McsReportSubscription[]>>;

  getServicesCostOverviewReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getResourceMonthlyCostReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getVirtualMachineBreakdownReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getPerformanceReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getAzureResourcesReport(): Observable<McsApiSuccessResponse<McsReportIntegerData[]>>;

  getCostRecommendations(): Observable<McsApiSuccessResponse<McsReportCostRecommendations>>;

  getServiceChanges(): Observable<McsApiSuccessResponse<McsReportServiceChangeInfo[]>>;

  getOperationalMonthlySavings(): Observable<McsApiSuccessResponse<McsReportOperationalSavings>>;

  getVMRightsizing(query?: McsRightSizingQueryParams): Observable<McsApiSuccessResponse<McsReportVMRightsizing[]>>;

  getVMRightsizingSummary(): Observable<McsApiSuccessResponse<McsReportVMRightsizingSummary>>;

  getResourceHealth(): Observable<McsApiSuccessResponse<McsReportResourceHealth>>;

  getSecurityScore(): Observable<McsApiSuccessResponse<McsReportSecurityScore>>;

  getResourceCompliance(period?: string): Observable<McsApiSuccessResponse<McsReportResourceCompliance>>;

  getMonitoringAndAlerting(): Observable<McsApiSuccessResponse<McsReportMonitoringAndAlerting>>;
}
