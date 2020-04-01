import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsCatalog,
  McsCatalogProduct,
  McsCatalogSolution,
  McsCatalogProductBracket,
  McsCatalogSolutionBracket
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiCatalogService } from '../interfaces/mcs-api-catalog.interface';

@Injectable()
export class McsApiCatalogService implements IMcsApiCatalogService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Catalog by ID (MCS API Response)
   * @param id Catalog identification
   */
  public getCatalog(): Observable<McsApiSuccessResponse<McsCatalog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalog>(McsCatalog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Catalog Products (MCS API Response)
   */
  public getCatalogProducts(): Observable<McsApiSuccessResponse<McsCatalogProductBracket>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/products';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogProductBracket>(McsCatalogProductBracket, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Catalog Product (MCS API Response)
   */
  public getCatalogProduct(id: string): Observable<McsApiSuccessResponse<McsCatalogProduct>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/products/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogProduct>(McsCatalogProduct, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Catalog Solutions (MCS API Response)
   */
  public getCatalogSolutions(): Observable<McsApiSuccessResponse<McsCatalogSolutionBracket>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/solutions';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogSolutionBracket>(McsCatalogSolutionBracket, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Catalog Solution (MCS API Response)
   */
  public getCatalogSolution(id: string): Observable<McsApiSuccessResponse<McsCatalogSolution>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/catalogs/solutions/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogSolution>(McsCatalogSolution, response);
          return apiResponse;
        })
      );
  }
}
