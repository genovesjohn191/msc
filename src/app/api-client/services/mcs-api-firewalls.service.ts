import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallFortiAnalyzer,
  McsFirewallFortiManager,
  McsFirewallPolicy,
  McsFwFortiAnalyzerQueryParams,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiFirewallsService } from '../interfaces/mcs-api-firewalls.interface';

@Injectable()
export class McsApiFirewallsService implements IMcsApiFirewallsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getFirewalls(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewall[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/firewalls';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewall[]>(McsFirewall, response);
          return apiResponse;
        })
      );
  }

  public getFirewall(id: any): Observable<McsApiSuccessResponse<McsFirewall>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/firewalls/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewall>(McsFirewall, response);
          return apiResponse;
        })
      );
  }

  public getFirewallPolicies(
    id: any,
    query?: McsQueryParam
  ): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/firewalls/${id}/policies`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewallPolicy[]>(McsFirewallPolicy, response);
          return apiResponse;
        })
      );
  }

  public getFirewallFortiManagers(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewallFortiManager[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/firewalls/forti-managers';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewallFortiManager[]>(McsFirewallFortiManager, response);
          return apiResponse;
        })
      );
  }

  public getFirewallFortiAnalyzers(query?: McsFwFortiAnalyzerQueryParams, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewallFortiAnalyzer[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('mode', query.mode);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/firewalls/forti-analyzers';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewallFortiAnalyzer[]>(McsFirewallFortiAnalyzer, response);
          return apiResponse;
        })
      );
  }
}
