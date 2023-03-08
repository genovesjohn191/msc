import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsPerpetualSoftware
} from '@app/models';

export interface IMcsApiPerpetualSoftwareService {

  /**
   * Gets all azure perpetual software
   */
  getAzurePerpetualSoftware(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsPerpetualSoftware[]>>;
}
