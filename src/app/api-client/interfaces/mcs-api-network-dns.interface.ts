import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsNetworkDnsSummary,
  McsQueryParam,
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
}
