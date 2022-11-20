import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsTicketQueryParams,
  McsUcsCentralInstance,
  McsUcsDomain,
  McsUcsObject,
  McsUcsQueryParams
} from '@app/models';

export interface IMcsApiUcsService {

  /**
   * Get a list of Ucs Domains from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
   getUcsDomains(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsDomain[]>>;

  /**
   * Get a list of Ucs Central Instances from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
   getUcsCentralInstances(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsCentralInstance[]>>;

  /**
   * Get combined list of the ucs domains and ucs central instances from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
   getUcsObjects(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsObject[]>>
}
