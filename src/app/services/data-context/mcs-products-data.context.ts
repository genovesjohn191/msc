import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsProduct,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { IMcsApiProductsService } from '@app/api-client';

export class McsProductsDataContext implements McsDataContext<McsProduct> {
  public totalRecordsCount: number = 0;

  constructor(private _productsService: IMcsApiProductsService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsProduct[]> {
    return this._productsService.getProducts().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsProduct> {
    return this._productsService.getProduct(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsProduct[]> {
    return this._productsService.getProducts(query).pipe(
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
