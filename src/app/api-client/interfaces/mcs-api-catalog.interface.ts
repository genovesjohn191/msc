import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsCatalog,
  McsCatalogProductBracket,
  McsCatalogSolutionBracket,
  McsCatalogProduct,
  McsCatalogSolution
} from '@app/models';

export interface IMcsApiCatalogService {
  /**
   * Get Catalog (MCS API Response)
   */
  getCatalog(): Observable<McsApiSuccessResponse<McsCatalog>>;

  /**
   * Get Catalog Products (MCS API Response)
   */
  getCatalogProducts(): Observable<McsApiSuccessResponse<McsCatalogProductBracket>>;

  /**
   * Get Catalog Product (MCS API Response)
   */
  getCatalogProduct(id: string): Observable<McsApiSuccessResponse<McsCatalogProduct>>;

  /**
   * Get Catalog Solutions (MCS API Response)
   */
  getCatalogSolutions(): Observable<McsApiSuccessResponse<McsCatalogSolutionBracket>>;

  /**
   * Get Catalog Solution (MCS API Response)
   */
  getCatalogSolution(id: string): Observable<McsApiSuccessResponse<McsCatalogSolution>>;
}
