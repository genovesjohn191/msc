import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsResource
} from '@app/models';
import { ResourcesApiService } from '../api-services/resources-api.service';

export class McsResourcesDataContext implements McsDataContext<McsResource> {
  public totalRecordsCount: number = 0;

  constructor(private _resourcesApiService: ResourcesApiService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsResource[]> {
    return this._resourcesApiService.getResources().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsResource> {
    return this._resourcesApiService.getResource(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsResource[]> {
    return this._resourcesApiService.getResources().pipe(
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
