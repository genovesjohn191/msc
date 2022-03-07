import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsSystemMessage,
  McsSystemMessageCreate,
  McsQueryParam,
  McsSystemMessageEdit,
  McsSystemMessageValidate
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiSystemService } from '../interfaces/mcs-api-system.interface';

/**
 * System Service Class
 */
@Injectable()
export class McsApiSystemService implements IMcsApiSystemService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getMessages(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSystemMessage[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/system/messages';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

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

  public getActiveMessages(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSystemMessage[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/system/active-messages';
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

  public createMessage(messageData: McsSystemMessageCreate):
    Observable<McsApiSuccessResponse<McsSystemMessageCreate>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/system/messages`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(messageData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsSystemMessageCreate>(McsSystemMessageCreate, response);
          return apiResponse;
        })
      );
  }

  public validateMessage(messageData: McsSystemMessageValidate):
    Observable<McsApiSuccessResponse<McsSystemMessage[]>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/system/messages/validate-requests';
    mcsApiRequestParameter.recordData = serializeObjectToJson(messageData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsSystemMessage[]>(McsSystemMessage, response);
          return apiResponse;
        })
      );
  }

  public editMessage(id: string, messageData: McsSystemMessageEdit):
    Observable<McsApiSuccessResponse<McsSystemMessageEdit>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/system/messages/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(messageData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsSystemMessageEdit>(McsSystemMessageEdit, response);
          return apiResponse;
        })
      );
  }

}
