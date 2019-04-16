import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsProduct,
  McsProductCatalog,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiProductsService } from '../interfaces/mcs-api-products.interface';

@Injectable()
export class McsApiProductsService implements IMcsApiProductsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Catalog (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getCatalogs(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsProductCatalog[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsProductCatalog[]>(McsProductCatalog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Catalog by ID (MCS API Response)
   * @param id Catalog identification
   */
  public getCatalog(id: any): Observable<McsApiSuccessResponse<McsProductCatalog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsProductCatalog>(McsProductCatalog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Products (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getProducts(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsProduct[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/products';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsProduct[]>(McsProduct, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Product by ID (MCS API Response)
   * @param id Product identification
   */
  public getProduct(id: any): Observable<McsApiSuccessResponse<McsProduct>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/products/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsProduct>(McsProduct, response);
          return apiResponse;
        })
      );
  }
}
