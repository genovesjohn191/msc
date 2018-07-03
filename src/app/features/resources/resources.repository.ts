import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { ResourcesService } from './resources.service';
import {
  Resource,
  ResourceCompute,
  ResourceStorage,
  ResourceNetwork,
  ResourceCatalogItem,
  ResourceVApp
} from './models';

@Injectable()
export class ResourcesRepository extends McsRepositoryBase<Resource> {

  constructor(private _resourcesApiService: ResourcesService) {
    super();
  }

  /**
   * This will obtain the resource compute values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceCompute(resource: Resource): Observable<ResourceCompute> {
    return this._resourcesApiService.getResourceCompute(resource.id)
      .pipe(
        map((response) => {
          this.updateRecordProperty(resource.compute, response.content);
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
  public findResourceStorage(resource: Resource): Observable<ResourceStorage[]> {
    return this._resourcesApiService.getResourceStorage(resource.id)
      .pipe(
        map((response) => {
          this.updateRecordProperty(resource.storage, response.content);
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
  public findResourceNetworks(resource: Resource): Observable<ResourceNetwork[]> {
    return this._resourcesApiService.getResourceNetworks(resource.id)
      .pipe(
        map((response) => {
          this.updateRecordProperty(resource.networks, response.content);
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
  public findResourceCatalogItems(resource: Resource): Observable<ResourceCatalogItem[]> {
    return this._resourcesApiService.getResourceCatalogItems(resource.id)
      .pipe(
        map((response) => {
          this.updateRecordProperty(resource.catalogItems, response.content);
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
  public findResourceVApps(resource: Resource): Observable<ResourceVApp[]> {
    return this._resourcesApiService.getResourceVApps(resource.id)
      .pipe(
        map((response) => {
          this.updateRecordProperty(resource.vApps, response.content);
          this.updateRecord(resource);
          return response.content;
        })
      );
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    _pageIndex: number,
    _pageSize: number,
    _keyword: string
  ): Observable<McsApiSuccessResponse<Resource[]>> {
    return this._resourcesApiService.getResources();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Resource>> {
    return this._resourcesApiService.getResource(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
