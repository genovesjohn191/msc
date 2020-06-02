import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiFirewallsService } from '../interfaces/mcs-api-firewalls.interface';

@Injectable()
export class McsApiFirewallsService implements IMcsApiFirewallsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Firewalls (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getFirewalls(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsFirewall[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/firewalls';
    mcsApiRequestParameter.searchParameters = searchParams;

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

  /**
   * Get firewall by ID (MCS API Response)
   * @param id Firewall identification
   */
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

  /**
   * Get all firewall policies (MCS API Response)
   * @param id Firewall identification
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getFirewallPolicies(
    id: any,
    query?: McsQueryParam
  ): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/firewalls/${id}/policies`;
    mcsApiRequestParameter.searchParameters = searchParams;

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
}
