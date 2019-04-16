import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy
} from '@app/models';

export interface IMcsApiFirewallsService {

  /**
   * Get Firewalls (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getFirewalls(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsFirewall[]>>;

  /**
   * Get firewall by ID (MCS API Response)
   * @param id Firewall identification
   */
  getFirewall(id: any): Observable<McsApiSuccessResponse<McsFirewall>>;

  /**
   * Get all firewall policies (MCS API Response)
   * @param id Firewall identification
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getFirewallPolicies( id: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>>;
}
