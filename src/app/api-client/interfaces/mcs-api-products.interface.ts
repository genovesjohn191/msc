import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsProductCatalog,
  McsProduct
} from '@app/models';

export interface IMcsApiProductsService {

  /**
   * Get Catalog (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getCatalogs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsProductCatalog[]>>;

  /**
   * Get Catalog by ID (MCS API Response)
   * @param id Catalog identification
   */
  getCatalog(id: any): Observable<McsApiSuccessResponse<McsProductCatalog>>;

  /**
   * Get Products (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getProducts(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsProduct[]>>;

  /**
   * Get Product by ID (MCS API Response)
   * @param id Product identification
   */
  getProduct(id: any): Observable<McsApiSuccessResponse<McsProduct>>;
}
