import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsExtenderService,
  McsExtendersQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiExtendersService } from '../interfaces/mcs-api-extenders.interface';

@Injectable()
export class McsApiExtendersService implements IMcsApiExtendersService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getExtenders(query?: McsExtendersQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsExtenderService[]>> {
    if (isNullOrEmpty(query)) { query = new McsExtendersQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/hybrid-cloud/extenders';
    mcsApiRequestParameter.searchParameters = McsExtendersQueryParams.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsExtenderService[]>(
            McsExtenderService, response
        );
      })
    );
  }

  public getExtenderServiceById(id: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsExtenderService>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/hybrid-cloud/extenders/${id}`;
    requestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsExtenderService>(
            McsExtenderService, response
          );
      })
    );
  }
}
