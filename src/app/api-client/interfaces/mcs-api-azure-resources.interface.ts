import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureResource,
  McsQueryParam
} from '@app/models';

export interface IMcsApiAzureResourcesService {

  /**
   * Gets all azure resources
   */
  getAzureResources(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAzureResource[]>>;

  /**
   * Gets an azure resource by id
   */
  getAzureResourceById(resourceId: string): Observable<McsApiSuccessResponse<McsAzureResource>>;
}
