import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsResource,
  McsResourceCompute,
  McsResourceStorage,
  McsResourceNetwork,
  McsResourceCatalogItem,
  McsResourceVApp,
  McsResourceCatalogItemCreate,
  McsJob,
  McsValidation
} from '@app/models';

export interface IMcsApiResourcesService {

  /**
   * Get Resources (MCS API Response)
   */
  getResources(): Observable<McsApiSuccessResponse<McsResource[]>>;

  /**
   * Get resource by ID (MCS API Response)
   * @param id Resource identification
   */
  getResource(id: any): Observable<McsApiSuccessResponse<McsResource>>;

  /**
   * Get resource compute by ID (MCS API Response)
   * @param id Resource identification
   */
  getResourceCompute(id: any): Observable<McsApiSuccessResponse<McsResourceCompute>>;

  /**
   * Get resource storage by ID (MCS API Response)
   * @param id Resource identification
   */
  getResourceStorage(id: any): Observable<McsApiSuccessResponse<McsResourceStorage[]>>;

  /**
   * Get resource networks by ID (MCS API Response)
   * @param resourceId Resource identification
   */
  getResourceNetworks(resourceId: any): Observable<McsApiSuccessResponse<McsResourceNetwork[]>>;

  /**
   * Get resource network details by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param networkId Network identification
   */
  getResourceNetwork(resourceId: any, networkId: any): Observable<McsApiSuccessResponse<McsResourceNetwork>>;

  /**
   * Get resource catalog items by ID (MCS API Response)
   * @param id Resource identification
   */
  getResourceCatalogItems(id: any): Observable<McsApiSuccessResponse<McsResourceCatalogItem[]>>;

  /**
   * Get resource vApps by ID (MCS API Response)
   * @param id Resource identification
   */
  getResourceVApps(id: any): Observable<McsApiSuccessResponse<McsResourceVApp[]>>;

  /**
   * Create the catalog item on the resource id provided
   * @param resourceId Resource Id where the catalog item will be created
   * @param createItemData Catalog item data to be used
   */
  createCatalogItem(resourceId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Validates the catalog items based on the inputted payload
   * @param resourceId Resource Id where the catalog items will be validated
   * @param createItemData Catalog item data to be used
   */
  validateCatalogItems(resourceId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsValidation[]>>;
}
