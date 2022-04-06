import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsPlannedWork,
  McsPlannedWorkAffectedService,
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
  getPlannedWorkById(id: string): Observable<McsApiSuccessResponse<McsPlannedWork>>;

  /**
   * Get planned work calendar ICS
   * @param id ID of the planned work to obtain
   */
  getPlannedWorkIcs(id: string): Observable<Blob>;

  /**
   * Get list of planned work affected services
   * @param id ID of the planned work to obtain
   */
  getPlannedWorkAffectedServices(id: string, query?: McsPlannedWorkQueryParams):
    Observable<McsApiSuccessResponse<McsPlannedWorkAffectedService[]>>;
}
