import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsSubscription,
  McsQueryParam
} from '@app/models';

export interface IMcsApiSubscriptionsService {

  /**
   * Gets all subscriptions
   */
  getSubscriptions(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSubscription[]>>;

  /**
   * Gets a subscription by id
   */
  getSubscriptionById(resourceId: string): Observable<McsApiSuccessResponse<McsSubscription>>;
}
