import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsApplicationRecovery,
  McsQueryParam
} from '@app/models';

export interface IMcsApiApplicationRecoveryService {

  /**
   * Gets all Application Recovery services
   */
  getApplicationRecovery(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsApplicationRecovery[]>>;

  /**
   * Gets an Application Recovery service by ID
   */
  getApplicationRecoveryById(uuid: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsApplicationRecovery>>;
}
