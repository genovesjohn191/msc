import {
  McsApiSuccessResponse,
  McsJob,
  McsQueryParam,
  McsStorageSaasBackup,
  McsStorageSaasBackupBackupAttempt,
  McsStorageSaasBackupBackupAttemptDetails,
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

  /**
   * Get saas backup by Id
   * @param id saas backup identification
   */
  getSaasBackup(id: string): Observable<McsApiSuccessResponse<McsStorageSaasBackup>>;

  /**
   * Get saas backup backup attempts
   * @param id saas backup identification
   */
  getSaasBackupBackupAttempt(id: string):
    Observable<McsApiSuccessResponse<McsStorageSaasBackupBackupAttempt>>;

  /**
   * Get saas backup backup attempt details
   * @param id saas backup identification
   */
  getSaasBackupBackupAttemptDetails(saasId: string, backupAttemptId: string):
    Observable<McsApiSuccessResponse<McsStorageSaasBackupBackupAttemptDetails>>;

  /**
   * Attempt/Reattempt SaaS backup
   * *Note: This will send a job (notification)
   * @param id saas backup identification
   */
  attemptSaasBackup(id: string): Observable<McsApiSuccessResponse<McsJob>>;
}