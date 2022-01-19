import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsAzureManagementService,
  McsAzureManagementServiceChild,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureManagementServicesService } from '../interfaces/mcs-api-azure-management-services.interface';

@Injectable()
export class McsApiAzureManagementServicesService implements IMcsApiAzureManagementServicesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureManagementServices(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureManagementService[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/management-services';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureManagementService[]>(
            McsAzureManagementService, response
        );
      })
    );
  }

  public getAzureManagementServiceById(id: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsAzureManagementService>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/management-services/${id}`;
    requestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureManagementService>(
            McsAzureManagementService, response
          );
      })
    );
  }

  public getAzureManagementServiceChildren(id: any): Observable<McsApiSuccessResponse<McsAzureManagementServiceChild[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/public-cloud/management-services/${id}/children`;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsAzureManagementServiceChild[]>(McsAzureManagementServiceChild, response);
          return apiResponse;
        })
      );
  }
}
