import { Injectable } from "@angular/core";
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsDrVeeamCloud,
  McsQueryParam,
} from "@app/models";
import { isNullOrEmpty } from "@app/utilities";
import { map, Observable, of } from "rxjs";
import { IMcsApiDrService } from "../interfaces/mcs-api-dr.interface";
import { McsApiClientHttpService } from "../mcs-api-client-http.service";

@Injectable()
export class McsApiDrService implements IMcsApiDrService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  getVeeamCloudDrs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsDrVeeamCloud[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/disaster-recovery/veeam-cloud';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsDrVeeamCloud[]>(McsDrVeeamCloud, response);
          return apiResponse;
        })
      );
  }

}