import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsOrder,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { OrdersApiService } from '../api-services/orders-api.service';

export class McsOrdersDataContext implements McsDataContext<McsOrder> {
  public totalRecordCount: number = 0;

  constructor(private _ordersApiService: OrdersApiService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsOrder[]> {
    return this._ordersApiService.getOrders().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsOrder> {
    return this._ordersApiService.getOrder(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsOrder[]> {
    return this._ordersApiService.getOrders(query).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Returns the API Content response on the map
   * @param apiResponse Api response from where the content will be obtained
   */
  private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
    if (isNullOrEmpty(apiResponse)) { return; }
    this.totalRecordCount = apiResponse.totalCount;
    return apiResponse.content;
  }
}
