import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureService,
  McsQueryParam
} from '@app/models';

export interface IMcsApiAzureServicesService {

  /**
   * Gets all azure services
   */
  getAzureServices(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsAzureService[]>>;

  /**
   * Gets a azure service by id
   */
  getAzureServiceById(resourceId: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsAzureService>>;
}
