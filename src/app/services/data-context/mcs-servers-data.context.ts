import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsServer,
  McsQueryParam,
  McsApiSuccessResponse
} from '@app/models';
import { IMcsApiServersService } from '@app/api-client';

export class McsServersDataContext implements McsDataContext<McsServer> {
  public totalRecordsCount: number = 0;

  constructor(private _serversService: IMcsApiServersService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsServer[]> {
    return this._serversService.getServers().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsServer> {
    return this._serversService.getServer(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsServer[]> {
    return this._serversService.getServers(query).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Returns the API Content response on the map
   * @param apiResponse Api response from where the content will be obtained
   */
  private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
    if (isNullOrEmpty(apiResponse)) { return; }
    this.totalRecordsCount = apiResponse.totalCount;
    return apiResponse.content;
  }
}
