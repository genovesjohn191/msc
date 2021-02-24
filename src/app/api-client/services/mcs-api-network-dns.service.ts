import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsNetworkDnsSummary,
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiNetworkDnsService } from '../interfaces/mcs-api-network-dns.interface';

@Injectable()
export class McsApiNetworkDnsService implements IMcsApiNetworkDnsService {

  constructor(private _apiClientService: McsApiClientHttpService) { }

  /**
   * Get all the network dns
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getNetworkDns(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsSummary[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/networks/dns';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsSummary[]>(McsNetworkDnsSummary, response)
      )
    );
  }


  /**
   * Get all the network dns zones
   * @param id dns id to get specific dns details
   */
  public getNetworkDnsById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsSummary>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${id}`;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsSummary>(McsNetworkDnsSummary, response)
      )
    );
  }
}
