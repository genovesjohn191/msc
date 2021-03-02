import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsBackUpAggregationTarget,
  McsQueryParam,
  McsBatLinkedService
} from '@app/models';

export interface IMcsApiBatsService {

  /**
   * Get all the backup aggregation targets
   */
  getBackUpAggregationTargets(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsBackUpAggregationTarget[]>>;

  /**
   * Get all the backup aggregation targets
   * @param id aggregation target identification
   */
  getBackUpAggregationTarget(id: string): Observable<McsApiSuccessResponse<McsBackUpAggregationTarget>>;

  /**
   * Get all the backup aggregation target linked services
   * @param id aggregation target identification
   */
  getBackUpAggregationTargetLinkedServices(id: string): Observable<McsApiSuccessResponse<McsBatLinkedService[]>>;
}
