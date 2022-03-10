import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsPortal,
  McsQueryParam
} from '@app/models';

export interface IMcsApiToolsService {

  /**
   * Get all the portals from the API
   */
  getPortals(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsPortal[]>>;
}
