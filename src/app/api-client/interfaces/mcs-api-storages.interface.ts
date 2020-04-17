import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsBackUpAggregationTarget,
  McsQueryParam
} from '@app/models';

export interface IMcsApiStoragesService {

  /**
   * Get all the backup aggregation targets
   */
  getBackUpAggregationTargets(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsBackUpAggregationTarget[]>>;

  /**
   * Get all the backup aggregation targets
   * @param id aggregation target identification
   */
  getBackUpAggregationTarget(id: string): Observable<McsApiSuccessResponse<McsBackUpAggregationTarget>>;
}
