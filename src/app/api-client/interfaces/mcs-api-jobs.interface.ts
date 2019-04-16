import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsJob
} from '@app/models';

export interface IMcsApiJobsService {

  /**
   * Get all the jobs from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getJobs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsJob[]>>;

  /**
   * Get job by ID (MCS API Response)
   * @param id JOB identification
   */
  getJob(id: any): Observable<McsApiSuccessResponse<McsJob>>;
}
