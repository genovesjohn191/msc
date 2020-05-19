import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsLicense
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiLicensesService } from '@app/api-client/interfaces/mcs-api-licenses.interface';

export class McsLicensesDataContext implements McsDataContext<McsLicense> {
  public totalRecordsCount: number = 0;

  constructor(private _licensesService: IMcsApiLicensesService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsLicense[]> {
    return this._licensesService.getLicenses().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsLicense> {
    return this._licensesService.getLicense(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsLicense[]> {
    return this._licensesService.getLicenses(query).pipe(
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
