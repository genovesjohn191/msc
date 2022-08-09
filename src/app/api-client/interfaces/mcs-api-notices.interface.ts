import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsJob,
  JobStatus,
  McsJobConnection,
  McsNotice,
  McsNoticeAssociatedService
} from '@app/models';

export interface IMcsApiNoticesService {

  /**
   * Get all the jobs from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNotices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNotice[]>>;

  /**
   * Get job by ID (MCS API Response)
   * @param id JOB identification
   */
  getNotice(id: any): Observable<McsApiSuccessResponse<McsNotice>>;

  /**
   * Get list of notices associated services
   * @param id ID of the notice to obtain
   */
  getNoticeAssociatedServices(id: string, query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsNoticeAssociatedService[]>>;
}
