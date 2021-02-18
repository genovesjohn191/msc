import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
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
  McsRightSizingQueryParams,
  McsReportManagementService,
  McsReportUpdateManagement
} from '@app/models';

export interface IMcsApiReportsService {
  getSubscriptions(): Observable<McsApiSuccessResponse<McsReportSubscription[]>>;

  getManagementServices(isEssentials?: boolean): Observable<McsApiSuccessResponse<McsReportManagementService[]>>;

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
    subscriptionIds?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getAzureResourcesReport(): Observable<McsApiSuccessResponse<McsReportIntegerData[]>>;

  getCostRecommendations(): Observable<McsApiSuccessResponse<McsReportCostRecommendations>>;

  getServiceChanges(): Observable<McsApiSuccessResponse<McsReportServiceChangeInfo[]>>;

  getOperationalMonthlySavings(): Observable<McsApiSuccessResponse<McsReportOperationalSavings>>;

  getVMRightsizing(query?: McsRightSizingQueryParams): Observable<McsApiSuccessResponse<McsReportVMRightsizing[]>>;

  getVMRightsizingSummary(): Observable<McsApiSuccessResponse<McsReportVMRightsizingSummary>>;

  getResourceHealth(): Observable<McsApiSuccessResponse<McsReportResourceHealth>>;

  getSecurityScore(): Observable<McsApiSuccessResponse<McsReportSecurityScore>>;

  getResourceCompliance(
    period?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportResourceCompliance>>;

  getMonitoringAndAlerting(
    period?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportMonitoringAndAlerting>>;

  getUpdateManagement(period?: string): Observable<McsApiSuccessResponse<McsReportUpdateManagement[]>>;
}
