import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsManagedSiemService
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiManagedSiemService } from '@app/api-client';

export class McsManagedSiemServicesDataContext implements McsDataContext<McsManagedSiemService> {
  public totalRecordsCount: number = 0;

  constructor(private _managedSiemService: IMcsApiManagedSiemService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsManagedSiemService[]> {
    return this._managedSiemService.getManagedSiemServices().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get subscription by id
   * @param id to get the record of
   */
  public getRecordById(id: string): Observable<McsManagedSiemService> {
    return of(undefined);
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsManagedSiemService[]> {
    return this._managedSiemService.getManagedSiemServices(_query).pipe(
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
