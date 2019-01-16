import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsCompany
} from '@app/models';
import { CompaniesApiService } from '../api-services/companies-api.service';

export class McsCompaniesDataContext implements McsDataContext<McsCompany> {
  public totalRecordCount: number = 0;

  constructor(private _companiesService: CompaniesApiService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsCompany[]> {
    return this._companiesService.getCompanies().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsCompany> {
    return this._companiesService.getCompany(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsCompany[]> {
    return this._companiesService.getCompanies(query).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Returns the API Content response on the map
   * @param apiResponse Api response from where the content will be obtained
   */
  private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
    if (isNullOrEmpty(apiResponse)) { return; }
    this.totalRecordCount = apiResponse.totalCount;
    return apiResponse.content;
  }
}
