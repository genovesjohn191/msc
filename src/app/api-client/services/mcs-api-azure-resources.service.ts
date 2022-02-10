import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsAzureResource,
  McsQueryParam,
  McsAzureResourceQueryParams
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureResourcesService } from '../interfaces/mcs-api-azure-resources.interface';

@Injectable()
export class McsApiAzureResourcesService implements IMcsApiAzureResourcesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureResources(query?: McsAzureResourceQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureResource[]>> {
    if (isNullOrEmpty(query)) { query = new McsAzureResourceQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/resources';
    mcsApiRequestParameter.searchParameters = McsAzureResourceQueryParams.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
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
