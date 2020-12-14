import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsReportGenericItem,
  McsReportIntegerData,
  McsReportSubscription,
  McsReportCostRecommendations,
  McsReportServiceChangeInfo,
  McsReportVMRightsizing,
  McsQueryParam,
  McsReportVMRightsizingSummary,
  McsReportOperationalSavings,
  McsReportResourceHealth,
  McsReportSecurityScore,
  McsReportMonitoringAndAlerting,
  McsReportResourceCompliance,
  McsRightSizingQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiReportsService } from '../interfaces/mcs-api-reports.interface';
import { isNullOrEmpty } from '@app/utilities';

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
    subscriptionIds?: string[]): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);
    if (!isNullOrEmpty(subscriptionIds)) {
      searchParams.set('subscription_ids', subscriptionIds.join());
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

  public getVMRightsizing(query?: McsRightSizingQueryParams): Observable<McsApiSuccessResponse<McsReportVMRightsizing[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('period_start', query.periodStart);
    searchParams.set('period_end', query.periodStart);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/vm-rightsizing';
    mcsApiRequestParameter.searchParameters = searchParams;

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

  public getMonitoringAndAlerting(period?: string): Observable<McsApiSuccessResponse<McsReportMonitoringAndAlerting>> {
    let searchParams = new Map<string, any>();
    searchParams.set('period', period);

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
}
