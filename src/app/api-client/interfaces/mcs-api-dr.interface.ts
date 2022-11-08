import {
  McsApiSuccessResponse,
  McsDrVeeamCloud,
  McsQueryParam,
} from "@app/models";
import { Observable } from "rxjs";

export interface IMcsApiDrService {
  /**
   * Get disaster recovery veeam-clouds (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVeeamCloudDrs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsDrVeeamCloud[]>>;

}