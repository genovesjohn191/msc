import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsManagedSiemService
} from '@app/models';

export interface IMcsApiManagedSiemService {

  /**
   * Gets all managed SIEM services
   */
  getManagedSiemServices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsManagedSiemService[]>>;
}
