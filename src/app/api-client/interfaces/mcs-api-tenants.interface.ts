import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsTenant,
} from '@app/models';

export interface IMcsApiTenantsService {

  /**
   * Get Tenants (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getTenants(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTenant[]>>;

  /**
   * Get tenant by ID (MCS API Response)
   * @param id Tenant identification
   */
  getTenant(id: any): Observable<McsApiSuccessResponse<McsTenant>>;
}
