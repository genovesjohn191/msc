import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { IMcsApiAzureManagementServicesService } from '@app/api-client';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsAzureManagementService
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsAzureManagementServicesDataContext implements McsDataContext<McsAzureManagementService> {
  public totalRecordsCount: number = 0;

  constructor(private _AzureManagementServicesService: IMcsApiAzureManagementServicesService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsAzureManagementService[]> {
    return this._AzureManagementServicesService.getAzureManagementServices().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get Azure Management Service by ID
   * @param id username to get the record from
   */
  public getRecordById(id: string): Observable<McsAzureManagementService> {
    return this._AzureManagementServicesService.getAzureManagementServiceById(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsAzureManagementService[]> {
    return this._AzureManagementServicesService.getAzureManagementServices(_query).pipe(
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
