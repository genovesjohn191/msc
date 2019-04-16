import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsCompany
} from '@app/models';

export interface IMcsApiCompaniesService {
  /**
   * Get all the companies from the API
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  getCompanies(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsCompany[]>>;

  /**
   * Get company by ID (MCS API Response)
   * @param id Company identification
   */
  getCompany(id: any): Observable<McsApiSuccessResponse<McsCompany>>;
}
