import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import { ServersService } from './servers.service';
import {
  ServerResource,
  ServerCompute,
  ServerStorage,
  ServerNetwork,
  ServerCatalogItem,
  ServerVApp,
  ServerServiceType
} from './models';

@Injectable()
export class ServersResourcesRespository extends McsRepositoryBase<ServerResource> {

  constructor(private _serversApiService: ServersService) {
    super();
  }

  /**
   * This will obtain the resource compute values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceCompute(resource: ServerResource): Observable<ServerCompute> {
    return this._serversApiService.getResourceCompute(resource.id)
      .map((response) => {
        resource.compute = response.content;
        this.updateRecord(resource);
        return response.content;
      });
  }

  /**
   * This will obtain the resource storages values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceStorage(resource: ServerResource): Observable<ServerStorage[]> {
    return this._serversApiService.getResourceStorage(resource.id)
      .map((response) => {
        resource.storage = response.content;
        this.updateRecord(resource);
        return response.content;
      });
  }

  /**
   * This will obtain the resource networks values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceNetworks(resource: ServerResource): Observable<ServerNetwork[]> {
    return this._serversApiService.getResourceNetworks(resource.id)
      .map((response) => {
        resource.networks = response.content;
        this.updateRecord(resource);
        return response.content;
      });
  }

  /**
   * This will obtain the resource catalog items values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceCatalogItems(resource: ServerResource): Observable<ServerCatalogItem[]> {
    return this._serversApiService.getResourceCatalogItems(resource.id)
      .map((response) => {
        resource.catalogItems = response.content;
        this.updateRecord(resource);
        return response.content;
      });
  }

  /**
   * This will obtain the resource vApps values from API
   * and update the instance of the data record from source
   * @param resource Instance of the resource from data records
   */
  public findResourceVApps(resource: ServerResource): Observable<ServerVApp[]> {
    return this._serversApiService.getResourceVApps(resource.id)
      .map((response) => {
        resource.vApps = response.content;
        this.updateRecord(resource);
        return response.content;
      });
  }

  /**
   * An observable event that emits when atleast one of the resources
   * service type is a self managed
   */
  public hasSelfManagedServer(): Observable<boolean> {
    return this.findAllRecords().map((_resources) => {
      if (isNullOrEmpty(_resources)) { return false; }
      let resourceExist = _resources.find((_resource) => {
        return _resource.serviceType === ServerServiceType.SelfManaged;
      });
      return !!(resourceExist);
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    _recordCount: number,
    _keyword: string
  ): Observable<McsApiSuccessResponse<ServerResource[]>> {
    return this._serversApiService.getServerResources();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<ServerResource>> {
    return this._serversApiService.getResource(recordId);
  }
}
