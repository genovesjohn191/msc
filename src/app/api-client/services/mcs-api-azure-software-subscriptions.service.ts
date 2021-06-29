import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsAzureSoftwareSubscription
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureSoftwareSubscriptionsService } from '../interfaces/mcs-api-software-subscriptions.interface';

@Injectable()
export class McsApiAzureSoftwareSubscriptionsService implements IMcsApiAzureSoftwareSubscriptionsService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureSoftwareSubscriptions(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsAzureSoftwareSubscription[]>> {
     // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/software-subscriptions`;
    requestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureSoftwareSubscription[]>(
            McsAzureSoftwareSubscription, response
        );
      })
    );
  }

  public getAzureSoftwareSubscriptionById(id: string): Observable<McsApiSuccessResponse<McsAzureSoftwareSubscription>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/software-subscriptions/${id}`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureSoftwareSubscription>(
            McsAzureSoftwareSubscription, response
          );
      })
    );
  }
}