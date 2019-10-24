import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsStorageBackUpAggregationTarget
} from '@app/models';

export interface IMcsApiStoragesService {
  getBackUpAggregationTargets(): Observable<McsApiSuccessResponse<McsStorageBackUpAggregationTarget[]>>;
}
