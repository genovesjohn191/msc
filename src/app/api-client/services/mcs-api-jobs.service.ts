import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsJob,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  JobStatus,
  McsJobConnection
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiJobsService } from '../interfaces/mcs-api-jobs.interface';

@Injectable()
export class McsApiJobsService implements IMcsApiJobsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public getJobs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsJob[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob[]>(McsJob, response);
          return apiResponse;
        })
      );
  }

  public getJobsByStatus(...statuses: JobStatus[]): Observable<McsApiSuccessResponse<McsJob[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/jobs/?status=${statuses.map((status) => `${JobStatus[status]}`)}`;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob[]>(McsJob, response);
        return apiResponse;
      })
    );
  }

  public getJob(id: any): Observable<McsApiSuccessResponse<McsJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/jobs/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob>(McsJob, response);
          return apiResponse;
        })
      );
  }

  public getJobConnection(): Observable<McsApiSuccessResponse<McsJobConnection>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/jobs/connection`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJobConnection>(McsJobConnection, response);
          return apiResponse;
        })
      );
  }
}
