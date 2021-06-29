import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsAzureSoftwareSubscription
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiAzureSoftwareSubscriptionsService } from '@app/api-client';

export class McsAzureSoftwareSubscriptionsDataContext implements McsDataContext<McsAzureSoftwareSubscription> {
  public totalRecordsCount: number = 0;

  constructor(private _azureSoftwareSubscriptionsService: IMcsApiAzureSoftwareSubscriptionsService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsAzureSoftwareSubscription[]> {
    return this._azureSoftwareSubscriptionsService.getAzureSoftwareSubscriptions().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get subscription by id
   * @param id username to get the record from
   */
  public getRecordById(id: string): Observable<McsAzureSoftwareSubscription> {
    return this._azureSoftwareSubscriptionsService.getAzureSoftwareSubscriptionById(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsAzureSoftwareSubscription[]> {
    return this._azureSoftwareSubscriptionsService.getAzureSoftwareSubscriptions(_query).pipe(
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