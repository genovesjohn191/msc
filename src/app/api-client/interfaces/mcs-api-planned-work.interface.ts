import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsPlannedWork,
  McsPlannedWorkQueryParams,
} from '@app/models';

export interface IMcsApiPlannedWorkService {

  /**
   * Get all the planned work from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getPlannedWork(query?: McsPlannedWorkQueryParams): Observable<McsApiSuccessResponse<McsPlannedWork[]>>;

  /**
   * Get the planned work from the API
   * @param id ID of the planned work to obtain
   */
   getPlannedWorkById(id: any): Observable<McsApiSuccessResponse<McsPlannedWork>>;
}
