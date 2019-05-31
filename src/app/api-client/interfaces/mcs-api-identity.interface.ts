import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsIdentity
} from '@app/models';

export interface IMcsApiIdentityService {

  /**
   * Get the user identity
   */
  getIdentity(): Observable<McsApiSuccessResponse<McsIdentity>>;
}
