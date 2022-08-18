import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsNotice,
  McsNoticeAssociatedService
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiNoticesService } from '../interfaces/mcs-api-notices.interface';

@Injectable()
export class McsApiNoticesService implements IMcsApiNoticesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getNotices(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNotice[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/notices';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsNotice[]>(McsNotice, response);
          return apiResponse;
        })
      );
  }

  public getNotice(id: string): Observable<McsApiSuccessResponse<McsNotice>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/notices/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsNotice>(McsNotice, response);
          return apiResponse;
        })
      );
  }

  public acknowledgeNotice(id: string): Observable<McsApiSuccessResponse<any>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/notices/${id}/acknowledge`;

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<any>(null, response);
          return apiResponse;
        })
      );
  }

  public getNoticeAssociatedServices(id: string, query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsNoticeAssociatedService[]>>{
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/notices/${id}/associated-services`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNoticeAssociatedService[]>(McsNoticeAssociatedService, response);
          return apiResponse;
        })
      );
  }
}
