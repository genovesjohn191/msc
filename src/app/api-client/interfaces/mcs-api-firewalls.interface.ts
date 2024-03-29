import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy,
  McsFirewallFortiManager,
  McsFirewallFortiAnalyzer,
  McsFwFortiAnalyzerQueryParams
} from '@app/models';

export interface IMcsApiFirewallsService {

  /**
   * Get Firewalls (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getFirewalls(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewall[]>>;

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

  /**
   * Get all fortimanager instances (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getFirewallFortiManagers(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewallFortiManager[]>>;

   /**
    * Get all fortianalyzer instances (MCS API Response)
    * @param query Query predicate that serves as the parameter of the endpoint
    */
  getFirewallFortiAnalyzers(query?: McsFwFortiAnalyzerQueryParams, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsFirewallFortiAnalyzer[]>>;
}
