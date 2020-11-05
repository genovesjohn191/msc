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
  McsReportServiceChangeInfo
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
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/performance';
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
}
