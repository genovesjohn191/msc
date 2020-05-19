import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsLicense,
} from '@app/models';

export interface IMcsApiLicensesService {

  /**
   * Get Licenses (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getLicenses(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsLicense[]>>;

  /**
   * Get license by ID (MCS API Response)
   * @param id License identification
   */
  getLicense(id: any): Observable<McsApiSuccessResponse<McsLicense>>;

}
