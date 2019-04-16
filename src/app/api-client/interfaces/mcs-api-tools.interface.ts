import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsPortal
} from '@app/models';

export interface IMcsApiToolsService {

  /**
   * Get all the portals from the API
   */
  getPortals(): Observable<McsApiSuccessResponse<McsPortal[]>>;
}
