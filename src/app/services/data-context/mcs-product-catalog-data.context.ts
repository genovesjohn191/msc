import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsProductCatalog,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { IMcsApiProductsService } from '@app/api-client';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsProductCatalogDataContext implements McsDataContext<McsProductCatalog> {
  public totalRecordsCount: number = 0;

  constructor(private _productsService: IMcsApiProductsService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsProductCatalog[]> {
    return this._productsService.getCatalogs().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsProductCatalog> {
    return this._productsService.getCatalog(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsProductCatalog[]> {
    return this._productsService.getCatalogs(query).pipe(
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
