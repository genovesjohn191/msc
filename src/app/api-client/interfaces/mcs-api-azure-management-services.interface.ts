import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureManagementService,
  McsAzureManagementServiceChild,
  McsManagementServiceQueryParams
} from '@app/models';

export interface IMcsApiAzureManagementServicesService {

  /**
   * Gets all Azure Management services
   */
  getAzureManagementServices(query?: McsManagementServiceQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureManagementService[]>>;

  /**
   * Gets a Azure Management service by ID
   */
  getAzureManagementServiceById(id: string, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsAzureManagementService>>;

  /**
   * Get all the Azure Management Service's children
   * @param id Azure Management Service identification
   */
  getAzureManagementServiceChildren(id: string): Observable<McsApiSuccessResponse<McsAzureManagementServiceChild[]>>;
}
