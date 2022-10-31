import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsService,
  McsNetworkDnsZone,
  McsNetworkDnsZoneBase,
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

  public getNetworkDnsServices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsService[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/networks/dns/services';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsService[]>(McsNetworkDnsService, response)
      )
    );
  }

  public getNetworkDnsServiceById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsService>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/services/${id}`;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsService>(McsNetworkDnsService, response)
      )
    );
  }

  public getNetworkDnsZones(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsZoneBase[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/networks/dns/zones';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsZoneBase[]>(McsNetworkDnsZoneBase, response)
      )
    );
  }

  public getNetworkDnsZoneById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsZone>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/zones/${id}`;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsZone>(McsNetworkDnsZone, response)
      )
    );
  }

  public createNetworkDnsZoneRecord(
    zoneId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/zones/${zoneId}/records`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.post(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsRrSetsRecord>(McsNetworkDnsRrSetsRecord, response)
      )
    );
  }

  public updateNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/zones/${zoneId}/records/${recordId}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.put(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsRrSetsRecord>(McsNetworkDnsRrSetsRecord, response)
      )
    );
  }

  public deleteNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string
  ): Observable<McsApiSuccessResponse<boolean>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/zones/${zoneId}/records/${recordId}`;

    return this._apiClientService.delete(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<boolean>(Boolean, response)
      )
    );
  }

  public updateNetworkDnsZoneTTL(
    zoneId: string,
    request: McsNetworkDnsZoneTtlRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsZone>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/networks/dns/zones/${zoneId}/ttl`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._apiClientService.put(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsNetworkDnsZone>(McsNetworkDnsZone, response)
      )
    );
  }
}
