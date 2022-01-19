import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { IMcsApiExtendersService } from '@app/api-client';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsExtenderService
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsExtendersDataContext implements McsDataContext<McsExtenderService> {
  public totalRecordsCount: number = 0;

  constructor(private _ExtendersService: IMcsApiExtendersService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsExtenderService[]> {
    return this._ExtendersService.getExtenders().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get Azure Extend Service by ID
   * @param id username to get the record from
   */
  public getRecordById(id: string): Observable<McsExtenderService> {
    return this._ExtendersService.getExtenderServiceById(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsExtenderService[]> {
    return this._ExtendersService.getExtenders(_query).pipe(
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
