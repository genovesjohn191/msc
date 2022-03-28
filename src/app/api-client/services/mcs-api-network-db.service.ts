import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsJob,
  McsNetworkDbMazAaQueryParams,
  McsNetworkDbMulticastIp,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkCreate,
  McsNetworkDbNetworkDelete,
  McsNetworkDbNetworkEvent,
  McsNetworkDbNetworkQueryParams,
  McsNetworkDbNetworkReserve,
  McsNetworkDbNetworkUpdate,
  McsNetworkDbPod,
  McsNetworkDbPodMazAa,
  McsNetworkDbSite,
  McsNetworkDbUseCase,
  McsNetworkDbVlan,
  McsNetworkDbVlanAction,
  McsNetworkDbVlanEvent,
  McsNetworkDbVni,
  McsQueryParam
} from '@app/models';
import {
  isNullOrEmpty,
  serializeObjectToJson
} from '@app/utilities';

import { IMcsApiNetworkDbService } from '../interfaces/mcs-api-network-db.interface';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';

@Injectable()
export class McsApiNetworkDbService implements IMcsApiNetworkDbService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getSites(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbSite[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/sites';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbSite[]>(McsNetworkDbSite, response);
          return apiResponse;
        })
      );
  }

  public getPods(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbPod[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/pods';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbPod[]>(McsNetworkDbPod, response);
          return apiResponse;
        })
      );
  }

  public getVlans(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbVlan[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/vlans';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbVlan[]>(McsNetworkDbVlan, response);
          return apiResponse;
        })
      );
  }

  public getVlan(id: number): Observable<McsApiSuccessResponse<McsNetworkDbVlan>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/vlans/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbVlan>(McsNetworkDbVlan, response);
          return apiResponse;
        })
      );
  }

  public getVlanEvents(id: number): Observable<McsApiSuccessResponse<McsNetworkDbVlanEvent[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/vlans/${id}/events`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbVlanEvent[]>(McsNetworkDbVlanEvent, response);
          return apiResponse;
        })
      );
  }

  public getVnis(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbVni[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/vnis';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbVni[]>(McsNetworkDbVni, response);
          return apiResponse;
        })
      );
  }

  public getUseCases(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsNetworkDbUseCase[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/use-cases';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbUseCase[]>(McsNetworkDbUseCase, response);
          return apiResponse;
        })
      );
  }

  public getMulticastIps(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsNetworkDbMulticastIp[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/multicast-ip-addresses';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbMulticastIp[]>(McsNetworkDbMulticastIp, response);
          return apiResponse;
        })
      );
  }

  public getNetworks(query?: McsNetworkDbNetworkQueryParams, optionalHeaders?: Map<string, any>):
  Observable<McsApiSuccessResponse<McsNetworkDbNetwork[]>> {
    if (isNullOrEmpty(query)) { query = new McsNetworkDbNetworkQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/network-db/networks';
    mcsApiRequestParameter.searchParameters = McsNetworkDbNetworkQueryParams.convertCustomQueryToParamMap(query);
    mcsApiRequestParameter.optionalHeaders = optionalHeaders;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbNetwork[]>(McsNetworkDbNetwork, response);
          return apiResponse;
        })
      );
  }

  public getNetwork(id: string): Observable<McsApiSuccessResponse<McsNetworkDbNetwork>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbNetwork>(McsNetworkDbNetwork, response);
          return apiResponse;
        })
      );
  }

  public createNetwork(payload: McsNetworkDbNetworkCreate):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(payload);

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

  public updateNetwork(id: string, payload: McsNetworkDbNetworkUpdate):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(payload);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  public deleteNetwork(id: string, deleteDetails: McsNetworkDbNetworkDelete):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(deleteDetails);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  public getNetworkEvents(id: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNetworkDbNetworkEvent[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks/${id}/events`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbNetworkEvent[]>(McsNetworkDbNetworkEvent, response);
          return apiResponse;
        })
      );
  }

  public getMazAaAvailablePods(query: McsNetworkDbMazAaQueryParams):
    Observable<McsApiSuccessResponse<McsNetworkDbPodMazAa>> {

    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsNetworkDbMazAaQueryParams(); }
    searchParams.set('pod_ids', query.podIds);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/pods/availability/maz-aa`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsNetworkDbPodMazAa>(McsNetworkDbPodMazAa, response);
          return apiResponse;
        })
      );
  }

  public recycleNetworkVlan(id: string, payload: McsNetworkDbVlanAction):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/vlans/${id}/recycle`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(payload);

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

  public reclaimNetworkVlan(id: string, payload: McsNetworkDbVlanAction):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/vlans/${id}/reclaim`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(payload);

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

  public reserveNetworkVlan(id: string, payload: McsNetworkDbNetworkReserve):
    Observable<McsApiSuccessResponse<McsJob>> {

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/network-db/networks/${id}/reserve`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(payload);

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