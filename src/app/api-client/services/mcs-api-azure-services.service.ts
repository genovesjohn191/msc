import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsAzureService,
  McsAzureServicesRequestParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureServicesService } from '../interfaces/mcs-api-azure-services.interface';

@Injectable()
export class McsApiAzureServicesService implements IMcsApiAzureServicesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureServices(query?: McsAzureServicesRequestParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureService[]>> {
     // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsAzureServicesRequestParams(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('tenant_id', query.tenantId);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/services`;
    requestParameter.searchParameters = searchParams;
    requestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureService[]>(
            McsAzureService, response
        );
      })
    );
  }

  public getAzureServiceById(id: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsAzureService>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/services/${id}`;
    requestParameter.optionalHeaders = optionalHeaders;

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
