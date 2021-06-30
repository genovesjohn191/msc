import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
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

  /**
   * Get all the CRISP orders from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getCrispOrders(query?: McsObjectCrispOrderQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispOrder[]>>;

  /**
   * Get detailed information about a CRISP order
   * @param orderId unique idenitifer of the element
   */
  getCrispOrder(orderId: string): Observable<McsApiSuccessResponse<McsObjectCrispOrder>>;

  /**
   * Get all the CRISP orders from the API
   * @param orderId unique idenitifer of the element
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getCrispOrderElements(orderId: string, query?: McsObjectCrispOrderQueryParams):
  Observable<McsApiSuccessResponse<McsObjectCrispElement[]>>;
}
