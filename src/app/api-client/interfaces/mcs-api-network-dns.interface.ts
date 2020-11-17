import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsNetworkDnsSummary,
  McsNetworkDnsZonesSummary
} from '@app/models';

export interface IMcsApiNetworkDnsService {

  /**
   * Get all the network dns
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworkDns(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsSummary[]>>;


  /**
   * Get all the network dns zones
   * @param id Id
   */
  getNetworkDnsZones(id: string): Observable<McsApiSuccessResponse<McsNetworkDnsZonesSummary>>;
}
