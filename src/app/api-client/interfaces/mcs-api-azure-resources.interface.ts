import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureResource,
  McsAzureResourceQueryParams
} from '@app/models';

export interface IMcsApiAzureResourcesService {

  /**
   * Gets all azure resources
   */
  getAzureResources(query?: McsAzureResourceQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureResource[]>>;

  /**
   * Gets all azure resources by subscription id
   */
  getAzureResourcesBySubscriptionId(subscriptionId?: string): Observable<McsApiSuccessResponse<McsAzureResource[]>>;


  /**
   * Gets an azure resource by id
   */
  getAzureResourceById(resourceId: string): Observable<McsApiSuccessResponse<McsAzureResource>>;
}
