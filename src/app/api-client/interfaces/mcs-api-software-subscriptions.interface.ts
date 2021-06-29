import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureSoftwareSubscription,
  McsQueryParam
} from '@app/models';

export interface IMcsApiAzureSoftwareSubscriptionsService {

  /**
   * Gets all azure software subscriptions
   */
  getAzureSoftwareSubscriptions(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAzureSoftwareSubscription[]>>;

  /**
   * Gets azure software subscription by id
   */
  getAzureSoftwareSubscriptionById(id: string): Observable<McsApiSuccessResponse<McsAzureSoftwareSubscription>>;
}
