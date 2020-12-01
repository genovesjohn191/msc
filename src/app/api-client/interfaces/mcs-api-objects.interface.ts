import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsObjectQueryParams
} from '@app/models';
import {
  McsObjectCrispElement,
  McsObjectInstalledService
} from '@app/models';

export interface IMcsApiObjectsService {
  /**
   * Get all the CRISP elements from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getCrispElements(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispElement[]>>;

  /**
   * Get detailed information about a CRISP Element
   * @param productId unique idenitifer of the element
   */
  getCrispElement(productId: string): Observable<McsApiSuccessResponse<McsObjectCrispElement>>;

  /**
   * Get all the installed services from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getInstalledServices(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectInstalledService[]>>;
}