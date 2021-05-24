import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsAzureDeploymentsQueryParams,
  McsJob,
  McsQueryParam,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity,
  McsTerraformDeploymentCreate,
  McsTerraformDeploymentCreateActivity,
  McsTerraformDeploymentDelete,
  McsTerraformDeploymentUpdate,
  McsTerraformModule,
  McsTerraformTag,
  McsTerraformTagQueryParams
} from '@app/models';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';

import { IMcsApiTerraformService } from '../interfaces/mcs-api-terraform.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

/**
 * Licenses Services Class
 */
@Injectable()
export class McsApiTerraformService implements IMcsApiTerraformService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getDeployments(query?: McsAzureDeploymentsQueryParams): Observable<McsApiSuccessResponse<McsTerraformDeployment[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsAzureDeploymentsQueryParams(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('company_id', query.companyId);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/terraform/deployments';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformDeployment[]>(McsTerraformDeployment, response);
          return apiResponse;
        })
      );
  }

  public getDeployment(id: any): Observable<McsApiSuccessResponse<McsTerraformDeployment>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformDeployment>(McsTerraformDeployment, response);
          return apiResponse;
        })
      );
  }

  public getDeploymentActivities(id: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTerraformDeploymentActivity[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}/activities`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformDeploymentActivity[]>(McsTerraformDeploymentActivity, response);
          return apiResponse;
        })
      );
  }

  public createDeployment(deploymentData: McsTerraformDeploymentCreate):
    Observable<McsApiSuccessResponse<McsTerraformDeployment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(deploymentData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformDeployment>(McsTerraformDeployment, response);
          return apiResponse;
        })
      );
  }

  public updateDeployment(id: any, deploymentData: McsTerraformDeploymentUpdate):
    Observable<McsApiSuccessResponse<McsTerraformDeployment>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(deploymentData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformDeployment>(McsTerraformDeployment, response);
          return apiResponse;
        })
      );
  }

  public deleteDeployment(id: any, request: McsTerraformDeploymentDelete): Observable<McsApiSuccessResponse<boolean>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<boolean>(Boolean, response);
          return apiResponse;
        })
      );
  }

  public getModules(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformModule[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/terraform/modules';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformModule[]>(McsTerraformModule, response);
          return apiResponse;
        })
      );
  }

  public getModule(id: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformModule>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/modules/${id}`;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformModule>(McsTerraformModule, response);
          return apiResponse;
        })
      );
  }

  public getTags(query?: McsTerraformTagQueryParams, optionalHeaders?: Map<string, any>)
    : Observable<McsApiSuccessResponse<McsTerraformTag[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsTerraformTagQueryParams(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('module_id', query.moduleId);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/terraform/tags';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformTag[]>(McsTerraformTag, response);
          return apiResponse;
        })
      );
  }

  public getTag(id: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformTag>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/tags/${id}`;
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsTerraformTag>(McsTerraformTag, response);
          return apiResponse;
        })
      );
  }

  public createDeploymentActivity(
    id: any,
    request: McsTerraformDeploymentCreateActivity
  ): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}/activities`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  // TODO: Check this out if the request payload is correct in API
  public createPlan(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}/activities`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  // TODO: Check this out if the request payload is correct in API
  public applyDeployment(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}/activities`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  // TODO: Check this out if the request payload is correct in API
  public destroyDeployment(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/terraform/deployments/${id}/activities`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(request);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

}
