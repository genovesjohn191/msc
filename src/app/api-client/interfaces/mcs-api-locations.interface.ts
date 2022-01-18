import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsLocation,
} from '@app/models';

export interface IMcsApiLocationsService {

  /**
   * Get Locations (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getLocations(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsLocation[]>>;

  /**
   * Get location by ID (MCS API Response)
   * @param id Location identification
   */
  getLocation(id: any): Observable<McsApiSuccessResponse<McsLocation>>;
}
