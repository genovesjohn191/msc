import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IMcsApiTerraformService } from '@app/api-client';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsTerraformDeployment
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsTerraformDeploymentsDataContext implements McsDataContext<McsTerraformDeployment> {
  public totalRecordsCount: number = 0;

  constructor(private _terraformApiService: IMcsApiTerraformService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsTerraformDeployment[]> {
    return this._terraformApiService.getDeployments().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsTerraformDeployment> {
    return this._terraformApiService.getDeployment(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsTerraformDeployment[]> {
    return this._terraformApiService.getDeployments(query).pipe(
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
