import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsObjectCrispElement,
  McsObjectInstalledService,
  McsApiRequestParameter,
  McsObjectQueryParams,
  ProductType
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { IMcsApiObjectsService } from '../interfaces/mcs-api-objects.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiObjectsService implements IMcsApiObjectsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getCrispElements(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispElement[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('company_id', query.companyId);
    searchParams.set('product_type', query.productType);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-elements';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement[]>(McsObjectCrispElement, response);
        })
      );
  }

  public getCrispElement(productId: string): Observable<McsApiSuccessResponse<McsObjectCrispElement>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/crisp-elements/${productId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement>(McsObjectCrispElement, response);
          return apiResponse;
        })
      );
  }

  public getInstalledServices(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectInstalledService[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('company_id', query.companyId);
    searchParams.set('product_type', query.productType);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-installed-services';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectInstalledService[]>(McsObjectInstalledService, response);
        })
      );
  }
}
