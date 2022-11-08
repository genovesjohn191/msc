import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsStorageSaasBackup,
  McsStorageVeeamBackup
} from "@app/models";
import { Observable } from "rxjs";

export interface IMcsApiStorageService {
  /**
   * Get veeam-cloud backups (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVeeamBackups(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsStorageVeeamBackup[]>>;

  /**
   * Get saas backups (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getSaasBackups(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsStorageSaasBackup[]>>;

}