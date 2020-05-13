import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsPlatform
} from '@app/models';

export interface IMcsApiPlatformService {

  /**
   * Get the platform settings from the API
   */
  getPlatform(): Observable<McsApiSuccessResponse<McsPlatform>>;
}
