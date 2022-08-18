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
   * Get all the notices from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getNotices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNotice[]>>;

  /**
   * Get job by ID (MCS API Response)
   * @param id notice identification
   */
  getNotice(id: string): Observable<McsApiSuccessResponse<McsNotice>>;

  /**
   * Acknowledge a notice (MCS API Response)
   * @param id notice identification
   */
  acknowledgeNotice(id: string): Observable<McsApiSuccessResponse<any>>;

  /**
   * Get list of notices associated services
   * @param id ID of the notice to obtain
   */
  getNoticeAssociatedServices(id: string, query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsNoticeAssociatedService[]>>;
}
