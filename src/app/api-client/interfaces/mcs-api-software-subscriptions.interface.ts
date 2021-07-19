import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureSoftwareSubscription,
  McsSoftwareSubscriptionProductType,
  McsQueryParam,
  McsSoftwareSubscriptionProductTypeQueryParams
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

  /**
   * Gets product types
   */
  getSoftwareSubscriptionProductTypes(query?: McsSoftwareSubscriptionProductTypeQueryParams): Observable<McsApiSuccessResponse<McsSoftwareSubscriptionProductType[]>>;
}
