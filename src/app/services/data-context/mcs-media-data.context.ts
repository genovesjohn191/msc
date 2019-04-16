import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsResourceMedia,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { IMcsApiMediaService } from '@app/api-client';

export class McsMediaDataContext implements McsDataContext<McsResourceMedia> {
  public totalRecordsCount: number = 0;

  constructor(private _mediaApiService: IMcsApiMediaService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsResourceMedia[]> {
    return this._mediaApiService.getMedia().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsResourceMedia> {
    return this._mediaApiService.getMedium(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsResourceMedia[]> {
    return this._mediaApiService.getMedia(query).pipe(
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
