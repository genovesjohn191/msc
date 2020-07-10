import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsSubscription
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiSubscriptionsService } from '@app/api-client';

export class McsSubscriptionsDataContext implements McsDataContext<McsSubscription> {
  public totalRecordsCount: number = 0;

  constructor(private _subscriptionService: IMcsApiSubscriptionsService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsSubscription[]> {
    return this._subscriptionService.getSubscriptions().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get subscription by id
   * @param id username to get the record from
   */
  public getRecordById(id: string): Observable<McsSubscription> {
    return this._subscriptionService.getSubscriptionById(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsSubscription[]> {
    return this._subscriptionService.getSubscriptions(_query).pipe(
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
