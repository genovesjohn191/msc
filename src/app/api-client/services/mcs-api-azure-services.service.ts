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
    if (isNullOrEmpty(query)) { query = new McsAzureServicesRequestParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/services';
    mcsApiRequestParameter.searchParameters = McsAzureServicesRequestParams.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
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
