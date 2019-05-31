import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsInternetPort
} from '@app/models';
import { IMcsApiInternetService } from '@app/api-client';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsInternetDataContext implements McsDataContext<McsInternetPort> {
  public totalRecordsCount: number = 0;

  constructor(private _internetApiService: IMcsApiInternetService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsInternetPort[]> {
    return this._internetApiService.getInternetPorts().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsInternetPort> {
    return this._internetApiService.getInternetPort(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsInternetPort[]> {
    return this._internetApiService.getInternetPorts(query).pipe(
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
