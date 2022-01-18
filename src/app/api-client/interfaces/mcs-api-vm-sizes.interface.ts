import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsVmSize,
} from '@app/models';

export interface IMcsApiVmSizesService {

  /**
   * Get VM Sizes (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVmSizes(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsVmSize[]>>;

  /**
   * Get VM Sizes by ID (MCS API Response)
   * @param id Location identification
   */
  getVmSize(id: any): Observable<McsApiSuccessResponse<McsVmSize>>;
}
