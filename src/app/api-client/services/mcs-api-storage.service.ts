import { Injectable } from "@angular/core";
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsJob,
  McsQueryParam,
  McsStorageSaasBackup,
  McsStorageSaasBackupAttemptQueryParams,
  McsStorageSaasBackupBackupAttempt,
  McsStorageSaasBackupBackupAttemptDetails,
  McsStorageVeeamBackup
} from "@app/models";
import { isNullOrEmpty } from "@app/utilities";
import { map, Observable, of } from "rxjs";
import { IMcsApiStorageService } from "../interfaces/mcs-api-storage.interface";
import { McsApiClientHttpService } from "../mcs-api-client-http.service";

@Injectable()
export class McsApiStorageService implements IMcsApiStorageService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  getVeeamBackups(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsStorageVeeamBackup[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/storage/backup/veeam-cloud';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsStorageVeeamBackup[]>(McsStorageVeeamBackup, response);
          return apiResponse;
        })
      );
  }

  getSaasBackups(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsStorageSaasBackup[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/storage/backup/saas';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsStorageSaasBackup[]>(McsStorageSaasBackup, response);
          return apiResponse;
        })
      );
  }

  public getSaasBackup(id: string): Observable<McsApiSuccessResponse<McsStorageSaasBackup>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/saas/${id}`;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsStorageSaasBackup>(McsStorageSaasBackup, response);
          return apiResponse;
        })
      );
  }

  public getSaasBackupBackupAttempt(id: string, 
    query?: McsStorageSaasBackupAttemptQueryParams
  ): Observable<McsApiSuccessResponse<McsStorageSaasBackupBackupAttempt>> {

    if (isNullOrEmpty(query)) { query = new McsStorageSaasBackupAttemptQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/saas/${id}/backup-attempts`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsStorageSaasBackupBackupAttempt>(McsStorageSaasBackupBackupAttempt, response);
          return apiResponse;
        })
      );
  }

  public getSaasBackupBackupAttemptDetails(
    saasId: string, 
    backupAttemptId: string
  ): Observable<McsApiSuccessResponse<McsStorageSaasBackupBackupAttemptDetails>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/saas/${saasId}/backup-attempts/${backupAttemptId}`;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsStorageSaasBackupBackupAttemptDetails>(McsStorageSaasBackupBackupAttemptDetails, response);
          return apiResponse;
        })
      );
  }

  public attemptSaasBackup(id: string): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/storage/backup/saas/${id}/backup-attempts`;

    return this._mcsApiHttpService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }
}