import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsPlatform,
  McsQueryParam,
  McsReportGenericItem
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiReportsService } from '../interfaces/mcs-api-reports.interface';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsApiReportsService implements IMcsApiReportsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getServicesCostOverviewReport(
    periodStart?: string,
    periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);

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
    periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/reports/virtual-machine-breakdown';
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
    periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>> {

    let searchParams = new Map<string, any>();
    searchParams.set('period_start', periodStart);
    searchParams.set('period_end', periodEnd);

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
}
