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
  McsTenant,
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiTenantsService } from '../interfaces/mcs-api-tenants.interface';

/**
 * Licenses Services Class
 */
@Injectable()
export class McsApiTenantsService implements IMcsApiTenantsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Tenant (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getTenants(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTenant[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/tenants';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTenant[]>(McsTenant, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get tenant by ID (MCS API Response)
   * @param id Tenant identification
   */
  public getTenant(id: any): Observable<McsApiSuccessResponse<McsTenant>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/tenants/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTenant>(McsTenant, response);
          return apiResponse;
        })
      );
  }
}
