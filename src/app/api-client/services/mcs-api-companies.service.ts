import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsCompany,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiCompaniesService } from '../interfaces/mcs-api-companies.interface';

@Injectable()
export class McsApiCompaniesService implements IMcsApiCompaniesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getCompanies(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsCompany[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/companies';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => McsApiSuccessResponse.deserializeResponse<McsCompany[]>(McsCompany, response))
      );
  }

  public getCompany(id: any): Observable<McsApiSuccessResponse<McsCompany>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/companies/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCompany>(McsCompany, response);
          return apiResponse;
        })
      );
  }

  public getCompanyActiveUser(): Observable<McsApiSuccessResponse<McsCompany>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/companies/my-company`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCompany>(McsCompany, response);
          return apiResponse;
        })
      );
  }
}
