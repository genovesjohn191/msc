import {
  Observable,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsConsole
} from '@app/models';
import { IMcsApiConsoleService } from '@app/api-client';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsConsoleDataContext implements McsDataContext<McsConsole> {
  public totalRecordsCount: number = 0;

  constructor(private _consoleService: IMcsApiConsoleService) { }

  /**
   * Get all records from the api service
   */
  public getAllRecords(): Observable<McsConsole[]> {
    return of(undefined);
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsConsole> {
    return this._consoleService.getServerConsole(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param _query Query to be sent to API to query the data
   */
  public filterRecords(_query: McsQueryParam): Observable<McsConsole[]> {
    return of(undefined);
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
