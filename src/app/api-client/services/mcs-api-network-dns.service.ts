import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsSummary,
  McsNetworkDnsZone,
  McsNetworkDnsZoneTtlRequest,
  McsQueryParam
} from '@app/models';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';

import { IMcsApiNetworkDnsService } from '../interfaces/mcs-api-network-dns.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiNetworkDnsService implements IMcsApiNetworkDnsService {

  constructor(private _apiClientService: McsApiClientHttpService) { }

  public getNetworkDns(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsSummary[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/networks/dns';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsSummary[]>(McsNetworkDnsSummary, response)
      )
    );
  }

  public getNetworkDnsById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsSummary>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${id}`;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsSummary>(McsNetworkDnsSummary, response)
      )
    );
  }

  public createNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${dnsId}/zones/${zoneId}/records`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.post(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsRrSetsRecord>(McsNetworkDnsRrSetsRecord, response)
      )
    );
  }

  public updateNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    recordId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${dnsId}/zones/${zoneId}/records/${recordId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.put(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsRrSetsRecord>(McsNetworkDnsRrSetsRecord, response)
      )
    );
  }

  public deleteNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    recordId: string
  ): Observable<McsApiSuccessResponse<boolean>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${dnsId}/zones/${zoneId}/records/${recordId}`;

    return this._apiClientService.delete(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<boolean>(Boolean, response)
      )
    );
  }

  public updateNetworkDnsZoneTTL(
    dnsId: string,
    zoneId: string,
    request: McsNetworkDnsZoneTtlRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsZone>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/${dnsId}/zones/${zoneId}/ttl`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.put(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsZone>(McsNetworkDnsZone, response)
      )
    );
  }
}
