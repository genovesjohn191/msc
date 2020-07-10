import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsAzureResource
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiAzureResourceService } from '@app/api-client';

export class McsAzureResourceDataContext implements McsDataContext<McsAzureResource> {
  public totalRecordsCount: number = 0;

  constructor(private _azureResourceService: IMcsApiAzureResourceService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsAzureResource[]> {
    return this._azureResourceService.getAzureResources().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get resource by resource id
   * @param resourceId username to get the record from
   */
  public getRecordById(resourceId: string): Observable<McsAzureResource> {
    return this._azureResourceService.getAzureResourceById(resourceId).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }
  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsAzureResource[]> {
    return this._azureResourceService.getAzureResources(query).pipe(
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
