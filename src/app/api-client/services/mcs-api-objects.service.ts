import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  McsObjectProjectsQueryParams,
  McsObjectProject,
  McsObjectProjectTasks,
  McsObjectVdcQueryParams,
  McsNetworkVdcPrecheckVlan
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { IMcsApiObjectsService } from '../interfaces/mcs-api-objects.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiObjectsService implements IMcsApiObjectsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getCrispElements(query?: McsObjectQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispElement[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('company_id', query.companyId);
    searchParams.set('product_type', query.productType);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-elements';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement[]>(McsObjectCrispElement, response);
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
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('company_id', query.companyId);
    searchParams.set('product_type', query.productType);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-installed-services';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectInstalledService[]>(McsObjectInstalledService, response);
        })
      );
  }

  public getCrispOrders(query?: McsObjectCrispOrderQueryParams): Observable<McsApiSuccessResponse<McsObjectCrispOrder[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('assignee', query.assignee);
    searchParams.set('state', query.state);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/crisp-orders';
    mcsApiRequestParameter.searchParameters = searchParams;

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

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('assignee', query.assignee);
    searchParams.set('state', query.state);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/crisp-orders/${orderId}/elements`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsObjectCrispElement[]>(McsObjectCrispElement, response);
        })
      );
  }

  public getProjects(query?: McsObjectProjectsQueryParams): Observable<McsApiSuccessResponse<McsObjectProject[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('state', query.state);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/objects/projects';
    mcsApiRequestParameter.searchParameters = searchParams;

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

  public getProjectTasks(projectId: string, query?: McsObjectProjectsQueryParams):
    Observable<McsApiSuccessResponse<McsObjectProjectTasks[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('state', query.state);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/objects/projects/${projectId}/tasks`;
    mcsApiRequestParameter.searchParameters = searchParams;

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
}
