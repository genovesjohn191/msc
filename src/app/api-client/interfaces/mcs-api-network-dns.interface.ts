import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsService,
  McsNetworkDnsZone,
  McsNetworkDnsZoneBase,
  McsNetworkDnsZoneTtlRequest,
  McsQueryParam
} from '@app/models';

export interface IMcsApiNetworkDnsService {

  /**
   * Get all the network dns services
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworkDnsServices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsService[]>>;

  /**
   * Gets a network dns service by id
   * @param id id of the network dns service
   */
  getNetworkDnsServiceById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsService>>;

  /**
   * Get all the network dns zones
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworkDnsZones(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsZoneBase[]>>;

  /**
   * Gets a network dns zone by id
   * @param id id of the network dns zone
   */
  getNetworkDnsZoneById(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsZone>>;

  createNetworkDnsZoneRecord(
    zoneId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>>;

  updateNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsRrSetsRecord>>;

  deleteNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string
  ): Observable<McsApiSuccessResponse<boolean>>;

  updateNetworkDnsZoneTTL(
    zoneId: string,
    request: McsNetworkDnsZoneTtlRequest
  ): Observable<McsApiSuccessResponse<McsNetworkDnsZone>>
}
