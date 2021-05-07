import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsCloudHealthAlert
} from '@app/models';
import { IMcsApiCloudHealthAlertService } from '../interfaces/mcs-api-cloudhealth-alert.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiCloudHealthAlertService implements IMcsApiCloudHealthAlertService {
  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getCloudHealthAlerts(
    periodStart?: string,
    periodEnd?: string
  ): Observable<McsApiSuccessResponse<McsCloudHealthAlert[]>> {
    let searchParams = new Map<string, any>();
    searchParams.set('created_on_start', periodStart);
    searchParams.set('created_on_end', periodEnd);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/cloudhealth/alerts';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCloudHealthAlert[]>(McsCloudHealthAlert, response);
          return apiResponse;
        })
      );
  }

  public getCloudHealthAlertById(id?: string): Observable<McsApiSuccessResponse<McsCloudHealthAlert>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/cloudhealth/alerts/' + id;

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsCloudHealthAlert>(McsCloudHealthAlert, response);
          return apiResponse;
        })
      );
  }
}