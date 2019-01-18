import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  switchMap
} from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsPortal,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { ToolsApiService } from '../api-services/tools-api.service';

export class McsToolsDataContext implements McsDataContext<McsPortal> {
  public totalRecordsCount: number = 0;

  constructor(private _toolsApiService: ToolsApiService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsPortal[]> {
    return this._toolsApiService.getPortals().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsPortal> {
    return this.getAllRecords().pipe(
      switchMap((response) => of(response.find((item) => item.id === id)))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsPortal[]> {
    return this._toolsApiService.getPortals().pipe(
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
