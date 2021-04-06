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
  McsLicense,
  McsAvailabilityZone,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAvailabilityZonesService } from '../interfaces/mcs-api-availability-zones.interface';

/**
 * Licenses Services Class
 */
@Injectable()
export class McsApiAvailabilityZonesService implements IMcsApiAvailabilityZonesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Availability Zones (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getAvailabilityZones(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAvailabilityZone[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/availability-zones';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsAvailabilityZone[]>(McsAvailabilityZone, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get availability zone by ID (MCS API Response)
   * @param id Availability Zone identification
   */
  public getAvailabilityZone(id: any): Observable<McsApiSuccessResponse<McsAvailabilityZone>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/availability-zones/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsAvailabilityZone>(McsAvailabilityZone, response);
          return apiResponse;
        })
      );
  }
}
