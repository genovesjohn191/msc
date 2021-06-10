import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsNetworkDbMulticastIp,
  McsNetworkDbNetwork,
  McsNetworkDbPod,
  McsNetworkDbSite,
  McsNetworkDbUseCase,
  McsNetworkDbVlan,
  McsNetworkDbVni,
  McsQueryParam
} from '@app/models';

export interface IMcsApiNetworkDbService {

  /**
   * Get all the Sites
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getSites(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbSite[]>>;

  /**
   * Get all the PODs
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getPods(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbPod[]>>;

  /**
   * Get all the VLANs
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVlans(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbVlan[]>>;

  /**
   * Get all the VNIs
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVnis(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbVni[]>>;

  /**
   * Get all the Use Cases
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getUseCases(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbUseCase[]>>;

  /**
   * Get all the Multicast IPs
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getMulticastIps(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbMulticastIp[]>>;

  /**
   * Get all the Networks
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNetworks(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbNetwork[]>>;
}
