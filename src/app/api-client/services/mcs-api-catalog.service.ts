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
