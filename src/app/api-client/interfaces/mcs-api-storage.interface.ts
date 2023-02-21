import {
  McsApiSuccessResponse,
  McsJob,
  McsQueryParam,
  McsSaasBackupAttempt,
  McsStorageSaasBackup,
  McsStorageSaasBackupAttemptQueryParams,
  McsStorageSaasBackupBackupAttempt,
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
   * Get SaaS backups (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getSaasBackups(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsStorageSaasBackup[]>>;

  /**
   * Get SaaS backup by Id
   * @param id SaaS backup identification
   */
  getSaasBackup(id: string): Observable<McsApiSuccessResponse<McsStorageSaasBackup>>;

  /**
   * Get SaaS backup backup attempts
   * @param id SaaS backup identification
   */
  getSaasBackupBackupAttempt(
    id: string,
    query?: McsStorageSaasBackupAttemptQueryParams):
    Observable<McsApiSuccessResponse<McsStorageSaasBackupBackupAttempt>>;

  /**
   * Attempt/Reattempt SaaS backup
   * *Note: This will send a job (notification)
   * @param id SaaS backup identification
   */
  attemptSaasBackup(id: string, request?: McsSaasBackupAttempt): Observable<McsApiSuccessResponse<McsJob>>;
}
