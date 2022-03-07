import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
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
import { isNullOrEmpty } from '@app/utilities';

import { IMcsApiReportsService } from '../interfaces/mcs-api-reports.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiReportsService implements IMcsApiReportsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getSubscriptions(): Observable<McsApiSuccessResponse<McsReportSubscription[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/subscriptions';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportSubscription[]>(McsReportSubscription, response);
        })
      );
  }

  public getManagementServices(isEssentials?: boolean): Observable<McsApiSuccessResponse<McsReportManagementService[]>> {
    let searchParams = new Map<string, any>();
    searchParams.set('is_essentials', isEssentials);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/management-services';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportManagementService[]>(McsReportManagementService, response);
        })
      );
  }

  public getServicesCostOverviewReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/services-cost-overview';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportGenericItem[]>(McsReportGenericItem, response);
        })
      );
  }

  public getResourceMonthlyCostReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/monthly-cost';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportGenericItem[]>(McsReportGenericItem, response);
        })
      );
  }

  public getVirtualMachineBreakdownReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/virtual-machine-usage-breakdown';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportGenericItem[]>(McsReportGenericItem, response);
        })
      );
  }

  public getPerformanceReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds);
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/performance-scalability';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportGenericItem[]>(McsReportGenericItem, response);
        })
      );
  }

  public getAzureResourcesReport(): Observable<McsApiSuccessResponse<McsReportIntegerData[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/azure-resources';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReportIntegerData[]>(McsReportIntegerData, response);
        })
      );
  }

  public getCostRecommendations(): Observable<McsApiSuccessResponse<McsReportCostRecommendations>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/cost-recommendations';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportCostRecommendations>(McsReportCostRecommendations, response);
          return apiResponse;
        })
      );
  }

  public getServiceChanges(): Observable<McsApiSuccessResponse<McsReportServiceChangeInfo[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/service-changes';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportServiceChangeInfo[]>(McsReportServiceChangeInfo, response);
          return apiResponse;
        })
      );
  }

  public getOperationalMonthlySavings(): Observable<McsApiSuccessResponse<McsReportOperationalSavings>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/potential-operational-savings';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportOperationalSavings>(McsReportOperationalSavings, response);
          return apiResponse;
        })
      );
  }

  public getVMRightsizing(query?: McsReportParams): Observable<McsApiSuccessResponse<McsReportVMRightsizing[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/vm-rightsizing';
    mcsApiRequestParameter.searchParameters = McsReportParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportVMRightsizing[]>(McsReportVMRightsizing, response);
          return apiResponse;
        })
      );
  }

  public getVMRightsizingSummary(): Observable<McsApiSuccessResponse<McsReportVMRightsizingSummary>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/rightsizing-summary';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportVMRightsizing>(McsReportVMRightsizingSummary, response);
          return apiResponse;
        })
      );
  }

  public getResourceHealth(): Observable<McsApiSuccessResponse<McsReportResourceHealth>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/resource-health';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportResourceHealth>(McsReportResourceHealth, response);
          return apiResponse;
        })
      );
  }

  public getSecurityScore(): Observable<McsApiSuccessResponse<McsReportSecurityScore>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/secure-score';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportSecurityScore>(McsReportSecurityScore, response);
          return apiResponse;
        })
      );
  }

  public getResourceCompliance(
    period?: string,
    subscriptionIds?: string[]
  ): Observable<McsApiSuccessResponse<McsReportResourceCompliance>> {
    let searchParams = new Map<string, any>();
    searchParams.set('period', period);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/compliance';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportResourceCompliance>(McsReportResourceCompliance, response);
          return apiResponse;
        })
      );
  }

  public getMonitoringAndAlerting(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportMonitoringAndAlerting>> {
    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
    }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/monitoring-alerting';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportMonitoringAndAlerting>(McsReportMonitoringAndAlerting, response);
          return apiResponse;
        })
      );
  }

  public getUpdateManagement(query?: McsReportUpdateManagementParams): Observable<McsApiSuccessResponse<McsReportUpdateManagement[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportUpdateManagementParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/update-management';
    mcsApiRequestParameter.searchParameters = McsReportUpdateManagementParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportUpdateManagement[]>(McsReportUpdateManagement, response);
          return apiResponse;
        })
      );
  }

  public getAscAlerts(
    periodStart?: string,
    periodEnd?: string): Observable<McsApiSuccessResponse<McsReportAscAlerts[]>> {
    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/asc-alerts';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportAscAlerts[]>(McsReportAscAlerts, response);
          return apiResponse;
        })
      );
  }

  public getAuditAlerts(query?: McsReportParams): Observable<McsApiSuccessResponse<McsReportAuditAlerts[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/audit-alerts';
    mcsApiRequestParameter.searchParameters = McsReportParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportAuditAlerts[]>(McsReportAuditAlerts, response);
          return apiResponse;
        })
      );
  }

  public getInefficientVms(query?: McsReportInefficientVmParams):
    Observable<McsApiSuccessResponse<McsReportInefficientVms[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportInefficientVmParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/inefficient-vms';
    mcsApiRequestParameter.searchParameters = McsReportInefficientVmParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportInefficientVms[]>(McsReportInefficientVms, response);
          return apiResponse;
        })
      );
  }

  public getTopVmsByCost(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsReportTopVmsByCost[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/vm-costs';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportTopVmsByCost[]>(McsReportTopVmsByCost, response);
          return apiResponse;
        })
      );
  }

  public getBillingSummaries(
    query?: McsReportBillingSummaryParams
  ): Observable<McsApiSuccessResponse<McsReportBillingServiceGroup[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportBillingSummaryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/billing';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse.deserializeResponse<McsReportBillingServiceGroup[]>(
          McsReportBillingServiceGroup, response
        );
        return apiResponse;
      })
    );
  }

  public getBillingSummariesCsv(
    query?: McsReportBillingSummaryParams,
    optionalHeaders?: Map<string, any>
  ): Observable<any> {
    if (isNullOrEmpty(query)) { query = new McsReportBillingSummaryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/billing';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;
    mcsApiRequestParameter.responseType = 'blob';

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => response)
    );
  }

  public getPlatformSecurityAdvisories(
    query?: McsReportParams
  ): Observable<McsApiSuccessResponse<McsReportPlatformSecurityAdvisories[]>> {
    if (isNullOrEmpty(query)) { query = new McsReportParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/platform-security-advisories';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse.deserializeResponse<McsReportPlatformSecurityAdvisories[]>(
          McsReportPlatformSecurityAdvisories, response
        );
        return apiResponse;
      })
    );
  }

  public getRecentServiceRequestSlt(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsReportRecentServiceRequestSlt[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/azure-service-request-slt';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        let apiResponse = McsApiSuccessResponse.deserializeResponse<McsReportRecentServiceRequestSlt[]>(
          McsReportRecentServiceRequestSlt, response
        );
        return apiResponse;
      })
    );
  }

  public getComputeResourceTotals(): Observable<McsApiSuccessResponse<McsReportComputeResourceTotals>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/reports/compute-resource-totals';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportComputeResourceTotals>(McsReportComputeResourceTotals, response);
          return apiResponse;
        })
      );
  }

  public getResourcesStorages(): Observable<McsApiSuccessResponse<McsReportStorageResourceUtilisation[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/reports/resource-storage';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsReportStorageResourceUtilisation[]>(McsReportStorageResourceUtilisation, response);
          return apiResponse;
        })
      );
  }
}