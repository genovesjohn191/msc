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

  /**
   * Get Active System Messages (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
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

  /**
   * This will create the new message based on the inputted information
   * @param messageData Message data to be created
   */
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

  /**
   * This will validate the message it has a conflicting messages
   * @param messageData Message data to be validated
   */
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

  /**
   * Edit system message by ID (MCS API Response)
   * @param id System Message identification
   * @param messageData Message to be edited
   */
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
