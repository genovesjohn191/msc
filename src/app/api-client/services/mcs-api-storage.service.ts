import { Injectable } from "@angular/core";
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsQueryParam,
  McsStorageSaasBackup,
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
}