import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsSystemMessage
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiSystemService } from '../interfaces/mcs-api-system.interface';

/**
 * System Service Class
 */
@Injectable()
export class McsApiSystemService implements IMcsApiSystemService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get System Messages (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getMessages(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSystemMessage[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/system/messages';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsSystemMessage[]>(McsSystemMessage, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get system message by ID (MCS API Response)
   * @param id System Message identification
   */
  public getMessage(id: string): Observable<McsApiSuccessResponse<McsSystemMessage>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/system/messages/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsSystemMessage>(McsSystemMessage, response);
          return apiResponse;
        })
      );
  }

}
