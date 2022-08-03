import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IMcsApiVCenterService } from '@app/api-client';
import {
  McsApiSuccessResponse,
  McsVCenterBaseline,
  McsVCenterBaselineQueryParam
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsVCenterBaselinesDataContext implements McsDataContext<McsVCenterBaseline> {
  public totalRecordsCount: number = 0;

  constructor(private _apiVCenter: IMcsApiVCenterService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsVCenterBaseline[]> {
    return this._apiVCenter.getVCenterBaselines().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsVCenterBaseline> {
    return this._apiVCenter.getVCenterBaseline(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsVCenterBaselineQueryParam): Observable<McsVCenterBaseline[]> {
    return this._apiVCenter.getVCenterBaselines(query).pipe(
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
