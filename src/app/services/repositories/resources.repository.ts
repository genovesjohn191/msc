import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import { getSafeProperty } from '@app/utilities';
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
import { ResourcesApiService } from '../api-services/resources-api.service';

@Injectable()
export class ResourcesRepository extends McsRepositoryBase<McsResource> {

  constructor(private _resourcesApiService: ResourcesApiService) {
    super();
  }

  /**
   * This will obtain the resource compute values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceCompute(resource: McsResource): Observable<McsResourceCompute> {
    return this._resourcesApiService.getResourceCompute(resource.id)
      .pipe(
        map((response) => {
          resource.compute = this.updateRecordProperty(
            resource.compute, response.content);
          this.updateRecord(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource storages values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceStorage(resource: McsResource): Observable<McsResourceStorage[]> {
    return this._resourcesApiService.getResourceStorage(resource.id)
      .pipe(
        map((response) => {
          resource.storage = this.updateRecordProperty(
            resource.storage, response.content);
          this.updateRecord(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource networks values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceNetworks(resource: McsResource): Observable<McsResourceNetwork[]> {
    return this._resourcesApiService.getResourceNetworks(resource.id)
      .pipe(
        map((response) => {
          resource.networks = this.updateRecordProperty(
            resource.networks, response.content);
          this.updateRecord(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource catalog items values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceCatalogItems(resource: McsResource): Observable<McsResourceCatalogItem[]> {
    return this._resourcesApiService.getResourceCatalogItems(resource.id)
      .pipe(
        map((response) => {
          resource.catalogItems = this.updateRecordProperty(
            resource.catalogItems, response.content);
          this.updateRecord(resource);
          return response.content;
        })
      );
  }

  /**
   * This will obtain the resource vApps values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceVApps(resource: McsResource): Observable<McsResourceVApp[]> {
    return this._resourcesApiService.getResourceVApps(resource.id)
      .pipe(
        map((response) => {
          resource.vApps = this.updateRecordProperty(
            resource.vApps, response.content);
          this.updateRecord(resource);
          return response.content;
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

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    _pageIndex: number,
    _pageSize: number,
    _keyword: string
  ): Observable<McsApiSuccessResponse<McsResource[]>> {
    return this._resourcesApiService.getResources();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsResource>> {
    return this._resourcesApiService.getResource(recordId);
  }
}
