import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsAccount
} from '@app/models';
import { McsDataContext } from '../core/mcs-data-context.interface';
import { IMcsApiAccountService } from '@app/api-client';

export class McsAccountDataContext implements McsDataContext<McsAccount> {
  public totalRecordsCount: number = 0;

  constructor(private _accountService: IMcsApiAccountService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsAccount[]> {
    return this._accountService.getUsers().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get user by username
   * @param username username to get the record from
   */
  public getRecordById(username: string): Observable<McsAccount> {
    return this._accountService.getUser(username).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsAccount[]> {
    return this._accountService.getUsers(query).pipe(
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
