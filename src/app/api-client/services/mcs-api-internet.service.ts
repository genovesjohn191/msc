import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsInternetPort,
  McsQueryParam,
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiInternetService } from '../interfaces/mcs-api-internet.interface';

@Injectable()
export class McsApiInternetService implements IMcsApiInternetService {

  constructor(private _apiClientService: McsApiClientHttpService) { }

  /**
   * Get all the internet ports
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getInternetPorts(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsInternetPort[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/networks/internet';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsInternetPort[]>(McsInternetPort, response)
      )
    );
  }

  /**
   * Get the internet port
   * @param id Internet port identification
   */
  public getInternetPort(id: string): Observable<McsApiSuccessResponse<McsInternetPort>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/networks/internet/${id}`;

    return this._apiClientService.get(mcsApiRequestParameter).pipe(
      map((response) =>
        McsApiSuccessResponse.deserializeResponse<McsInternetPort>(McsInternetPort, response)
      )
    );
  }
}
