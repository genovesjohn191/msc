import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsPerpetualSoftware
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiPerpetualSoftwareService } from '@app/api-client';

export class McsPerpetualSoftwareDataContext implements McsDataContext<McsPerpetualSoftware> {
  public totalRecordsCount: number = 0;

  constructor(private _perpetualSoftwareService: IMcsApiPerpetualSoftwareService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsPerpetualSoftware[]> {
    return this._perpetualSoftwareService.getAzurePerpetualSoftware().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get subscription by id
   * @param id username to get the record from
   */
  public getRecordById(id: string): Observable<McsPerpetualSoftware> {
    return of(undefined);
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsPerpetualSoftware[]> {
    return this._perpetualSoftwareService.getAzurePerpetualSoftware(_query).pipe(
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