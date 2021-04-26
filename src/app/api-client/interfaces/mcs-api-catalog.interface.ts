import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsCatalog,
  McsCatalogEnquiry,
  McsCatalogEnquiryRequest,
  McsCatalogProduct,
  McsCatalogProductBracket,
  McsCatalogSolution,
  McsCatalogSolutionBracket
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
   * Create Catalog Product Enquiry
   */
   createCatalogProductEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsApiSuccessResponse<McsCatalogEnquiry>>;

  /**
   * Get Catalog Solutions (MCS API Response)
   */
  getCatalogSolutions(): Observable<McsApiSuccessResponse<McsCatalogSolutionBracket>>;

  /**
   * Get Catalog Solution (MCS API Response)
   */
  getCatalogSolution(id: string): Observable<McsApiSuccessResponse<McsCatalogSolution>>;

  /**
   * Create Catalog Solution Enquiry
   */
   createCatalogSolutionEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsApiSuccessResponse<McsCatalogEnquiry>>;
}
