import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
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
import { serializeObjectToJson } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiResourcesService } from '../interfaces/mcs-api-resources.interface';

@Injectable()
export class McsApiResourcesService implements IMcsApiResourcesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Resources (MCS API Response)
   */
  public getResources(): Observable<McsApiSuccessResponse<McsResource[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/resources';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResource[]>(McsResource, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource by ID (MCS API Response)
   * @param id Resource identification
   */
  public getResource(id: any): Observable<McsApiSuccessResponse<McsResource>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResource>(McsResource, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource compute by ID (MCS API Response)
   * @param id Resource identification
   */
  public getResourceCompute(id: any): Observable<McsApiSuccessResponse<McsResourceCompute>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${id}/compute`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceCompute>(McsResourceCompute, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource storage by ID (MCS API Response)
   * @param id Resource identification
   */
  public getResourceStorage(id: any): Observable<McsApiSuccessResponse<McsResourceStorage[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${id}/storage`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceStorage[]>(McsResourceStorage, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource networks by ID (MCS API Response)
   * @param resourceId Resource identification
   */
  public getResourceNetworks(resourceId: any):
    Observable<McsApiSuccessResponse<McsResourceNetwork[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/networks`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceNetwork[]>(McsResourceNetwork, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource network details by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param networkId Network identification
   */
  public getResourceNetwork(resourceId: any, networkId: any):
    Observable<McsApiSuccessResponse<McsResourceNetwork>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/networks/${networkId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceNetwork>(McsResourceNetwork, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource catalogs (MCS API Response)
   * @param resourceId Resource identification
   */
  public getResourceCatalogs(resourceId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalog[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceCatalog[]>(McsResourceCatalog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource catalog by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   */
  public getResourceCatalog(resourceId: string, catalogId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs/${catalogId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceCatalog>(McsResourceCatalog, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource catalog items by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   */
  public getResourceCatalogItems(resourceId: string, catalogId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs/${catalogId}/items`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceCatalogItem[]>(McsResourceCatalogItem, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource catalog items by ID (MCS API Response)
   * @param resourceId Resource identification
   * @param catalogId Catalog identification
   * @param itemId Catalog Item identification
   */
  public getResourceCatalogItem(resourceId: string, catalogId: string, itemId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs/${catalogId}/items/${itemId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceCatalogItem>(McsResourceCatalogItem, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get resource vApps by ID (MCS API Response)
   * @param id Resource identification
   */
  public getResourceVApps(id: any): Observable<McsApiSuccessResponse<McsResourceVApp[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${id}/vapps`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceVApp[]>(McsResourceVApp, response);
          return apiResponse;
        })
      );
  }

  /**
   * Create the catalog item on the resource id provided
   * @param resourceId Resource Id where the catalog item will be created
   * @param catalogId Catalog Id where the catalog item will be attached
   * @param createItemData Catalog item data to be used
   */
  public createResourceCatalogItem(resourceId: string, catalogId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs/${catalogId}/items`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(createItemData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Validates the catalog items based on the inputted payload
   * @param resourceId Resource Id where the catalog items will be validated
   * @param createItemData Catalog item data to be used
   */
  public validateCatalogItems(resourceId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsValidation[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/resources/${resourceId}/catalogs/payload-validation-requests`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(createItemData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsValidation[]>(McsValidation, response);
          return apiResponse;
        })
      );
  }
}
