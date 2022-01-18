import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isNullOrEmpty
} from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsLocation,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiLocationsService } from '../interfaces/mcs-api-locations.interface';
import { HttpClient } from '@angular/common/http';

/**
 * Locations Services Class
 */
@Injectable()
export class McsApiLocationsService implements IMcsApiLocationsService {

  constructor(private _mcsApiService: McsApiClientHttpService, private httpClient: HttpClient) { }

  public getLocations(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsLocation[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/locations';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    let url = '../../../assets/mock-data/locations.json';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsLocation[]>(McsLocation, response);
          return apiResponse;
        })
      );
  }

  public getLocation(id: string): Observable<McsApiSuccessResponse<McsLocation>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/locations/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsLocation>(McsLocation, response);
          return apiResponse;
        })
      );
  }
}
