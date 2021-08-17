import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse
} from '@app/models';

export interface IMcsApiAuthService {

  /**
   * Extend current JWT session
   */
  extendSession(): Observable<McsApiSuccessResponse<string>>;
}
