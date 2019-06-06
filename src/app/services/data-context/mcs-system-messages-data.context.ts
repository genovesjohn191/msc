import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsSystemMessage,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { IMcsApiSystemService } from '@app/api-client';

export class McsSystemMessagesDataContext implements McsDataContext<McsSystemMessage> {
  public totalRecordsCount: number = 0;

  constructor(private _messagesApiService: IMcsApiSystemService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsSystemMessage[]> {
    return this._messagesApiService.getMessages().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsSystemMessage> {
    return this._messagesApiService.getMessage(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsSystemMessage[]> {
    return this._messagesApiService.getMessages(query).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Returns the API Content response on the map
   * @param apiResponse Api response from where the content will be obtained
   */
  private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
    if (isNullOrEmpty(apiResponse)) { return; }
    this.totalRecordsCount = apiResponse.totalCount;
    return apiResponse.content;
  }
}
