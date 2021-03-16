import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsKeyValue
} from "@app/models";
import { IMcsApiMetadataService } from "../interfaces/mcs-api-metadata.interface";
import { McsApiClientHttpService } from "../mcs-api-client-http.service";

@Injectable()
export class McsApiMetadataService implements IMcsApiMetadataService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getLinks(): Observable<McsApiSuccessResponse<McsKeyValue[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/metadata/links';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsKeyValue[]>(McsKeyValue, response);
          return apiResponse;
        })
      );
  }
}