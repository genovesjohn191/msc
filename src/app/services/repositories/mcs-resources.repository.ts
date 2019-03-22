import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsAccessControlService,
  CoreDefinition
} from '@app/core';
import { getSafeProperty } from '@app/utilities';
import {
  McsResource,
  McsResourceCompute,
  McsResourceStorage,
  McsResourceNetwork,
  McsResourceCatalogItem,
  McsResourceVApp,
  ServiceType,
  McsResourceCatalogItemCreate,
  McsJob,
  McsApiSuccessResponse,
  McsValidation
} from '@app/models';
import { ResourcesApiService } from '../api-services/resources-api.service';
import { McsResourcesDataContext } from '../data-context/mcs-resources-data.context';

@Injectable()
export class McsResourcesRepository extends McsRepositoryBase<McsResource> {

  constructor(
    private _resourcesApiService: ResourcesApiService,
    private _accessControlService: McsAccessControlService
  ) {
    super(new McsResourcesDataContext(_resourcesApiService));
  }

  /**
   * This will obtain the resource compute values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public getResourceCompute(resource: McsResource): Observable<McsResourceCompute> {
    return this._resourcesApiService.getResourceCompute(resource.id)
      .pipe(
        map((response) => {
          resource.compute = this.updateRecordProperty(
            resource.compute, response.content);
          this.addOrUpdate(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource storages values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public getResourceStorage(resource: McsResource): Observable<McsResourceStorage[]> {
    return this._resourcesApiService.getResourceStorage(resource.id)
      .pipe(
        map((response) => {
          resource.storage = this.updateRecordProperty(
            resource.storage, response.content);
          this.addOrUpdate(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource networks values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public getResourceNetworks(resource: McsResource): Observable<McsResourceNetwork[]> {
    return this._resourcesApiService.getResourceNetworks(resource.id)
      .pipe(
        map((response) => {
          resource.networks = this.updateRecordProperty(
            resource.networks, response.content);
          this.addOrUpdate(resource);
          return response.content;
        })
      );
  }

  /**
   * Get resource network details by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param networkId Network identification
   */
  public getResourceNetwork(
    resourceId: string,
    networkId: string
  ): Observable<McsResourceNetwork> {
    return this._resourcesApiService.getResourceNetwork(resourceId, networkId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * This will obtain the resource catalog items values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public getResourceCatalogItems(resource: McsResource): Observable<McsResourceCatalogItem[]> {
    return this._resourcesApiService.getResourceCatalogItems(resource.id)
      .pipe(
        map((response) => {
          resource.catalogItems = this.updateRecordProperty(
            resource.catalogItems, response.content);
          this.addOrUpdate(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource vApps values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public getResourceVApps(resource: McsResource): Observable<McsResourceVApp[]> {
    return this._resourcesApiService.getResourceVApps(resource.id)
      .pipe(
        map((response) => {
          resource.vApps = this.updateRecordProperty(
            resource.vApps, response.content);
          this.addOrUpdate(resource);
          return response.content;
        })
      );
  }

  /**
   * Get all the resources based on the access control
   * @note OrderEdit and EnableCreateManagedServer
   */
  public getResourcesByAccess(): Observable<McsResource[]> {
    return this.getAll().pipe(
      map((resources) => {
        let managedResourceIsOn = this._accessControlService.hasAccess(
          ['OrderEdit'], CoreDefinition.FEATURE_FLAG_ENABLE_CREATE_MANAGED_SERVER);

        return resources.filter(
          (resource) => resource.serviceType === ServiceType.SelfManaged ||
            (managedResourceIsOn && resource.serviceType === ServiceType.Managed)
        );
      })
    );
  }

  /**
   * Creates the resource catalog item on the provided resource id
   * @param resourceId Resource ID where the catalog item will be created
   * @param catalogItem Catalog item to be created
   */
  public createResourceCatalogItem(
    resourceId: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsJob> {
    return this._resourcesApiService.createCatalogItem(resourceId, catalogItem)
      .pipe(map((response) => getSafeProperty(response, (obj) => obj.content)));
  }

  /**
   * Validates the catalog items based on the inputted payload
   * @param resourceId Resource Id where the catalog items will be validated
   * @param createItemData Catalog item data to be used
   */
  public validateCatalogItems(
    resourceId: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsApiSuccessResponse<McsValidation[]>> {
    return this._resourcesApiService.validateCatalogItems(resourceId, catalogItem);
  }
}
