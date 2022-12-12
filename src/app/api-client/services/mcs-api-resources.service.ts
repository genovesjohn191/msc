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
  McsResourceCatalog,
  McsQueryParam,
  McsPhysicalServer
} from '@app/models';
import { isNullOrEmpty, serializeObjectToJson } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiResourcesService } from '../interfaces/mcs-api-resources.interface';
import { McsApiClientDefinition } from '../mcs-api-client.definition';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class McsApiResourcesService implements IMcsApiResourcesService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getResources(optionalHeaders?: Map<string, any>, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsResource[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/resources';
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

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

  public getResource(id: any): Observable<McsApiSuccessResponse<McsResource>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${id}`;

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

  public getResourceCompute(id: any): Observable<McsApiSuccessResponse<McsResourceCompute>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${id}/compute`;

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

  public getResourceStorage(id: any, optionalHeaders?: Map<string, any>, query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsResourceStorage[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${id}/storage`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

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

  public getVdcStorage(resourceId: string, storageId: string): Observable<McsApiSuccessResponse<McsResourceStorage>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/storage/${storageId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsResourceStorage>(McsResourceStorage, response);
          return apiResponse;
        })
      );
  }

  public getResourceNetworks(resourceId: any, optionalHeaders?: Map<string, any>, query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsResourceNetwork[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/networks`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

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

  public getResourceNetwork(resourceId: any, networkId: any, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsResourceNetwork>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/networks/${networkId}`;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

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

  public getResourceCatalogs(resourceId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalog[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs`;

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

  public getResourceCatalog(resourceId: string, catalogId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalog>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs/${catalogId}`;

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

  public getResourceCatalogItems(resourceId: string, catalogId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs/${catalogId}/items`;

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

  public getResourceCatalogItem(resourceId: string, catalogId: string, itemId: string):
    Observable<McsApiSuccessResponse<McsResourceCatalogItem>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs/${catalogId}/items/${itemId}`;

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

  public getResourceVApps(id: any): Observable<McsApiSuccessResponse<McsResourceVApp[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${id}/vapps`;

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

  public createResourceCatalogItem(resourceId: string, catalogId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs/${catalogId}/items`;
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

  public validateCatalogItems(resourceId: string, createItemData: McsResourceCatalogItemCreate):
    Observable<McsApiSuccessResponse<McsValidation[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${resourceId}/catalogs/payload-validation-requests`;
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

  public getPhysicalServers(id:string, query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsPhysicalServer[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/private-cloud/resources/${id}/physical-servers`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsPhysicalServer[]>(McsPhysicalServer, response);
          return apiResponse;
        })
      );
  }
}
