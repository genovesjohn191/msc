import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsNetworkDnsSummary
} from '@app/models';

export interface IMcsApiNetworkDnsService {

  /**
   * Get all the network dns
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworkDnss(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDnsSummary[]>>;
}
