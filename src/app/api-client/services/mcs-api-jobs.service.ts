import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsJob,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  JobStatus
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiJobsService } from '../interfaces/mcs-api-jobs.interface';

@Injectable()
export class McsApiJobsService implements IMcsApiJobsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get all the jobs from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getJobs(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsJob[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob[]>(McsJob, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get all jobs based on its status
   * @param statuses Statuses to be filtered
   */
  public getJobsByStatus(...statuses: JobStatus[]): Observable<McsApiSuccessResponse<McsJob[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/jobs/?status=${statuses.map((status) => `${JobStatus[status]},`)}`;

    return this._mcsApiService.get(mcsApiRequestParameter).pipe(
      map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse.deserializeResponse<McsJob[]>(McsJob, response);
        return apiResponse;
      })
    );
  }

  /**
   * Get job by ID (MCS API Response)
   * @param id JOB identification
   */
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
}
