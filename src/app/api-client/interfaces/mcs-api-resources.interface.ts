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
  McsValidation,
  McsResourceCatalog
} from '@app/models';

export interface IMcsApiResourcesService {

  /**
   * Get Resources (MCS API Response)
   */
  getResources(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsResource[]>>;

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
  getResourceStorage(id: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsResourceStorage[]>>;

  getVdcStorage(resourceId: string, storageId: string): Observable<McsApiSuccessResponse<McsResourceStorage>>;

  /**
   * Get resource networks by ID (MCS API Response)
   * @param resourceId Resource identification
   */
  getResourceNetworks(resourceId: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsResourceNetwork[]>>;

  /**
   * Get resource network details by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param networkId Network identification
   */
  getResourceNetwork(resourceId: any, networkId: any, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsResourceNetwork>>;

  /**
   * Get resource catalogs (MCS API Response)
   * @param resourceId Resource identification
   */
  getResourceCatalogs(resourceId: string): Observable<McsApiSuccessResponse<McsResourceCatalog[]>>;

  /**
   * Get resource catalog by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   */
  getResourceCatalog(resourceId: string, catalogId: string): Observable<McsApiSuccessResponse<McsResourceCatalog>>;

  /**
   * Get resource catalog items by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   */
  getResourceCatalogItems(resourceId: string, catalogId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem[]>>;

  /**
   * Get resource catalog items by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   * @param itemId Catalog Item identification
   */
  getResourceCatalogItem(resourceId: string, catalogId: string, itemId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem>>;

  /**
   * Get resource vApps by ID (MCS API Response)
   * @param id Resource identification
   */
  getResourceVApps(id: any): Observable<McsApiSuccessResponse<McsResourceVApp[]>>;

  /**
   * Create the catalog item on the resource id provided
   * @param resourceId Resource Id where the catalog item will be created
   * @param catalogId Catalog Id where the catalog item will be attached
   * @param createItemData Catalog item data to be used
   */
  createResourceCatalogItem(resourceId: string, catalogId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Validates the catalog items based on the inputted payload
   * @param resourceId Resource Id where the catalog items will be validated
   * @param createItemData Catalog item data to be used
   */
  validateCatalogItems(resourceId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsValidation[]>>;
}
