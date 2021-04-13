import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsAvailabilityZone,
} from '@app/models';

export interface IMcsApiAvailabilityZonesService {

  /**
   * Get Availability Zones (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getAvailabilityZones(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAvailabilityZone[]>>;

  /**
   * Get availability zone by ID (MCS API Response)
   * @param id Availability Zone identification
   */
  getAvailabilityZone(id: any): Observable<McsApiSuccessResponse<McsAvailabilityZone>>;
}
