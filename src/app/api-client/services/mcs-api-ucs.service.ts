import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsUcsDomain,
  McsUcsCentralInstance,
  McsUcsObject,
  UcsObjectType,
  McsUcsQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiUcsService } from '../interfaces/mcs-api-ucs.interface';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsApiUcsService implements IMcsApiUcsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getUcsDomains(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsDomain[]>> {
    if (isNullOrEmpty(query)) { query = new McsUcsQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/ucs/domains';
    mcsApiRequestParameter.searchParameters = McsUcsQueryParams.convertCustomQueryToParamMap(query);
    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsUcsDomain[]>(McsUcsDomain, response);
          return apiResponse;
        })
      );
  }

  public getUcsCentralInstances(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsCentralInstance[]>> {
    if (isNullOrEmpty(query)) { query = new McsUcsQueryParams(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/private-cloud/ucs/central-instances';
    mcsApiRequestParameter.searchParameters = McsUcsQueryParams.convertCustomQueryToParamMap(query);
  
    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsUcsCentralInstance[]>(McsUcsCentralInstance, response);
          return apiResponse;
        })
      );
  }

  public getUcsObjects(query?: McsUcsQueryParams): Observable<McsApiSuccessResponse<McsUcsObject[]>> {
    if (isNullOrEmpty(query)) { query = new McsUcsQueryParams(); }

    let domainsObservable = this.getUcsDomains(query);
    let centralInstancesObservable = this.getUcsCentralInstances(query);

    return forkJoin([domainsObservable, centralInstancesObservable]).pipe(
      map(results => {
        let ucsObjects = new Array<McsUcsObject>();
        let domainsResult = results[0];
        let centralInstancesResult = results[1];

        domainsResult.content.forEach(element => {
          let domains = this._mcsUcsObjectMapper(element, UcsObjectType.UcsDomain);
          ucsObjects.push(domains);
        });

        centralInstancesResult.content.forEach(installedService => {
          let centralInstances = this._mcsUcsObjectMapper(installedService, UcsObjectType.UcsCentral);
          ucsObjects.push(centralInstances);
        });

        let response: McsApiSuccessResponse<McsUcsObject[]> = {
          status: domainsResult.status,
          totalCount: ucsObjects.length,
          content: ucsObjects
        }

        return response;
      })
    );
  }

  private _mcsUcsObjectMapper(item: McsUcsDomain | McsUcsCentralInstance, type: string): McsUcsObject {
    return {
      id: item.id,
      availabilityZone: item.availabilityZone,
      podName: item.podName,
      managementName: item.managementName,
      active: item.active,
      domainGroups: item.domainGroups,
      objectType: type
    };
  }
}
