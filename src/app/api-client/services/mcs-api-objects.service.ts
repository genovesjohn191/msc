import { Injectable } from '@angular/core';
import {
  forkJoin,
  Observable
} from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsObjectCrispElement,
  McsObjectInstalledService,
  McsApiRequestParameter,
  McsObjectQueryParams,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
  McsObjectProject,
  McsObjectProjectTasks,
  McsObjectVdcQueryParams,
  McsNetworkVdcPrecheckVlan,
  McsObjectProjectParams,
  McsObjectCrispObject
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { IMcsApiObjectsService } from '../interfaces/mcs-api-objects.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { CrispObjectType } from '@app/models/enumerations/crisp-object-type.enum';

@Injectable()
export class McsApiObjectsService implements IMcsApiObjectsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getCrispElements(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispElement[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-elements';
    mcsApiRequestParameter.searchParameters = McsObjectQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement[]>(McsObjectCrispElement, response);
        })
      );
  }

  public getCrispObjects(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispObject[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectQueryParams(); }

    let crispElementsObservable = this.getCrispElements(query);
    let installedServicesObservable = this.getInstalledServices(query);

    return forkJoin([crispElementsObservable, installedServicesObservable]).pipe(
      map(results => {
        let crispObjects = new Array<McsObjectCrispObject>();
        let crispElementsResult = results[0];
        let installedServicesResult = results[1];

        crispElementsResult.content.forEach(element => {
          let crispObject = this._mcsObjectCrispObjectMapper(element, CrispObjectType.Elements);
          crispObjects.push(crispObject);
        });

        installedServicesResult.content.forEach(installedService => {
          let crispObject = this._mcsObjectCrispObjectMapper(installedService, CrispObjectType.InstalledServices);
          crispObjects.push(crispObject);
        });

        let response: McsApiSuccessResponse<McsObjectCrispObject[]> = {
          status: crispElementsResult.status,
          totalCount: crispObjects.length,
          content: crispObjects
        }

        return response;
      })
    );
  }

  public getCrispElement(productId: string): Observable<McsApiSuccessResponse<McsObjectCrispElement>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/crisp-elements/${productId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement>(McsObjectCrispElement, response);
          return apiResponse;
        })
      );
  }

  public getInstalledServices(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectInstalledService[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-installed-services';
    mcsApiRequestParameter.searchParameters = McsObjectQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectInstalledService[]>(McsObjectInstalledService, response);
        })
      );
  }

  public getCrispOrders(query?: McsObjectCrispOrderQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispOrder[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectCrispOrderQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-orders';
    mcsApiRequestParameter.searchParameters = McsObjectCrispOrderQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispOrder[]>(McsObjectCrispOrder, response);
        })
      );
  }

  public getCrispOrder(orderId: string): Observable<McsApiSuccessResponse<McsObjectCrispOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/crisp-orders/${orderId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsObjectCrispOrder>(McsObjectCrispOrder, response);
          return apiResponse;
        })
      );
  }

  public getCrispOrderElements(orderId: string, query?: McsObjectCrispOrderQueryParams):
  Observable<McsApiSuccessResponse<McsObjectCrispElement[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectCrispOrderQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/crisp-orders/${orderId}/elements`;
    mcsApiRequestParameter.searchParameters = McsObjectCrispOrderQueryParams.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement[]>(McsObjectCrispElement, response);
        })
      );
  }

  public getProjects(query?: McsObjectProjectParams): Observable<McsApiSuccessResponse<McsObjectProject[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectProjectParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/projects';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectProject[]>(McsObjectProject, response);
        })
      );
  }

  public getProject(projectId: string): Observable<McsApiSuccessResponse<McsObjectProject>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/projects/${projectId}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsObjectProject>(McsObjectProject, response);
          return apiResponse;
        })
      );
  }

  public getProjectTasks(projectId: string, query?: McsObjectProjectParams):
    Observable<McsApiSuccessResponse<McsObjectProjectTasks[]>> {
    if (isNullOrEmpty(query)) { query = new McsObjectProjectParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/projects/${projectId}/tasks`;
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectProjectTasks[]>(McsObjectProjectTasks, response);
        })
      );
  }

  public getVdcNetworkPrecheck(query?: McsObjectVdcQueryParams): Observable<McsApiSuccessResponse<McsNetworkVdcPrecheckVlan>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('vdc_id', query.vdcId);
    searchParams.set('network_service_id', query.networkServiceId);
    searchParams.set('network_id', query.networkId);

    let requestHeaders = new Map<string, any>();
    requestHeaders.set('company-id', query.companyId);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/provision-vdc-network-precheck';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = requestHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsNetworkVdcPrecheckVlan>(McsNetworkVdcPrecheckVlan, response);
          return apiResponse;
        })
      );
  }

  private _mcsObjectCrispObjectMapper(item: McsObjectCrispElement | McsObjectInstalledService, type: string): McsObjectCrispObject {
    return {
      companyId: item.companyId,
      companyName: item.companyName,
      createdOn: item.createdOn,
      description: item.description,
      productId: item.productId,
      productType: item.productType,
      serviceId: item.serviceId,
      objectType: type
    };
  }
}
