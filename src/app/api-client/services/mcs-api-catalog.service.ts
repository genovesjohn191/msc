import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsCatalog,
  McsCatalogEnquiry,
  McsCatalogEnquiryRequest,
  McsCatalogProduct,
  McsCatalogProductBracket,
  McsCatalogSolution,
  McsCatalogSolutionBracket
} from '@app/models';
import { serializeObjectToJson } from '@app/utilities';

import { IMcsApiCatalogService } from '../interfaces/mcs-api-catalog.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

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

  public createCatalogProductEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsApiSuccessResponse<McsCatalogEnquiry>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/catalogs/products/${id}/enquiries`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogEnquiry>(McsCatalogEnquiry, response);
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

  public createCatalogSolutionEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsApiSuccessResponse<McsCatalogEnquiry>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/catalogs/solutions/${id}/enquiries`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCatalogEnquiry>(McsCatalogEnquiry, response);
          return apiResponse;
        })
      );
  }
}
