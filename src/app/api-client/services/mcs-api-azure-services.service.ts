import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsApiRequestParameter,
  McsAzureService
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureServicesService } from '../interfaces/mcs-api-azure-services.interface';

@Injectable()
export class McsApiAzureServicesService implements IMcsApiAzureServicesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  /**
   * Gets all the subscriptions
   */
  public getAzureServices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAzureService[]>> {
     // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/services`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureService[]>(
            McsAzureService, response
        );
      })
    );
  }
  /**
   * Gets a subscription by id
   */
  public getAzureServiceById(id: string): Observable<McsApiSuccessResponse<McsAzureService>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/services/${id}`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureService>(
            McsAzureService, response
          );
      })
    );
  }
}
