import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsAzureResource,
  McsQueryParam
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureResourcesService } from '../interfaces/mcs-api-azure-resources.interface';

@Injectable()
export class McsApiAzureResourcesService implements IMcsApiAzureResourcesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureResources(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAzureResource[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/resources`;
    requestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureResource[]>(
            McsAzureResource, response
        );
      })
    );
  }

  public getAzureResourcesBySubscriptionId(subscriptionId: string): Observable<McsApiSuccessResponse<McsAzureResource[]>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/resources?subscription_id=${subscriptionId}`;

    return this._mcsApiHttpService.get(requestParameter)
    .pipe(
      map((response) => {
        return McsApiSuccessResponse.deserializeResponse<McsAzureResource[]>(
          McsAzureResource, response
      );
    })
  );
  }


  public getAzureResourceById(resourceId: string): Observable<McsApiSuccessResponse<McsAzureResource>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();

    requestParameter.endPoint = `/public-cloud/resources/${resourceId}`;
    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureResource>(
            McsAzureResource, response
          );
      })
    );
  }
}
