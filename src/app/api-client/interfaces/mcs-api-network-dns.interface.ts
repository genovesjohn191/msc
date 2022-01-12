import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsSummary,
  McsNetworkDnsZone,
  McsNetworkDnsZoneTtlRequest,
  McsQueryParam
} from '@app/models';

export interface IMcsApiNetworkDnsService {

  /**
   * Get all the network dns
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworkDns(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsSummary[]>>;

  /**
   * Gets a network dns by id
   * @param id id of the network dns
   */
  getNetworkDnsById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsSummary>>;

  createNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>>;

  updateNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    recordId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>>;

  deleteNetworkDnsZoneRecord(
    dnsId: string,
    zoneId: string,
    recordId: string
  ): Observable<McsApiSuccessResponse<boolean>>;

  updateNetworkDnsZoneTTL(
    dnsId: string,
    zoneId: string,
    request: McsNetworkDnsZoneTtlRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsZone>>
}
