import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsApiRequestParameter,
  McsSubscription
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiSubscriptionsService } from '../interfaces/mcs-api-subscriptions.interface';

@Injectable()
export class McsApiSubscriptionsService implements IMcsApiSubscriptionsService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  /**
   * Gets all the subscriptions
   */
  public getSubscriptions(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSubscription[]>> {
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
          return McsApiSuccessResponse.deserializeResponse<McsSubscription[]>(
            McsSubscription, response
        );
      })
    );
  }
  /**
   * Gets a subscription by id
   */
  public getSubscriptionById(id: string): Observable<McsApiSuccessResponse<McsSubscription>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/services/${id}`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsSubscription>(
            McsSubscription, response
          );
      })
    );
  }
}
