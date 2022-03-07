import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsReportAscAlerts,
  McsReportAuditAlerts,
  McsReportRecentServiceRequestSlt,
  McsReportBillingServiceGroup,
  McsReportBillingSummaryParams,
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
  McsReportStorageResourceUtilisation,
  McsReportSubscription,
  McsReportTopVmsByCost,
  McsReportUpdateManagement,
  McsReportVMRightsizing,
  McsReportVMRightsizingSummary,
  McsRightSizingQueryParams,
  McsReportInefficientVmParams,
  McsReportUpdateManagementParams
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

  getVMRightsizing(query?: McsReportParams): Observable<McsApiSuccessResponse<McsReportVMRightsizing[]>>;

  getVMRightsizingSummary(): Observable<McsApiSuccessResponse<McsReportVMRightsizingSummary>>;

  getResourceHealth(): Observable<McsApiSuccessResponse<McsReportResourceHealth>>;

  getSecurityScore(): Observable<McsApiSuccessResponse<McsReportSecurityScore>>;

  getResourceCompliance(
    period?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportResourceCompliance>>;

  getMonitoringAndAlerting(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportMonitoringAndAlerting>>;

  getUpdateManagement(query?: McsReportUpdateManagementParams): Observable<McsApiSuccessResponse<McsReportUpdateManagement[]>>;

  getAscAlerts(
    periodStart?: string,
    periodEnd?: string): Observable<McsApiSuccessResponse<McsReportAscAlerts[]>>;

  getAuditAlerts(query?: McsReportParams): Observable<McsApiSuccessResponse<McsReportAuditAlerts[]>>;

  getInefficientVms(query?: McsReportInefficientVmParams): Observable<McsApiSuccessResponse<McsReportInefficientVms[]>>;

  getTopVmsByCost(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsReportTopVmsByCost[]>>;

  getBillingSummaries(query?: McsReportBillingSummaryParams): Observable<McsApiSuccessResponse<McsReportBillingServiceGroup[]>>;

  getBillingSummariesCsv(
    query?: McsReportBillingSummaryParams,
    optionalHeaders?: Map<string, any>): Observable<any>;

  getPlatformSecurityAdvisories(query?: McsReportParams): Observable<McsApiSuccessResponse<McsReportPlatformSecurityAdvisories[]>>;

  getRecentServiceRequestSlt(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsReportRecentServiceRequestSlt[]>>;

  getComputeResourceTotals(): Observable<McsApiSuccessResponse<McsReportComputeResourceTotals>>;

  getResourcesStorages(): Observable<McsApiSuccessResponse<McsReportStorageResourceUtilisation[]>>;
}