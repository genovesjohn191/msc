import { IMcsApiNetworkDbService } from '@app/api-client';
import
{
    McsApiSuccessResponse,
    McsNetworkDbNetwork,
    McsQueryParam
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsDataContext } from '../core/mcs-data-context.interface';

export class McsNetworkDbDataContext implements McsDataContext<McsNetworkDbNetwork> {
    public totalRecordsCount: number = 0;

    constructor(private _networkService: IMcsApiNetworkDbService) { }

  /**
   * Get all records from the api service
   */
   public getAllRecords(): Observable<McsNetworkDbNetwork[]> {
    return this._networkService.getNetworks().pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Get record by entity id
   * @param id Entity id to get the record from
   */
  public getRecordById(id: string): Observable<McsNetworkDbNetwork> {
    return this._networkService.getNetwork(id).pipe(
      map((response) => this._getApiContentResponse(response))
    );
  }

  /**
   * Filters the records based on the query provided
   * @param query Query to be sent to API to query the data
   */
  public filterRecords(query: McsQueryParam): Observable<McsNetworkDbNetwork[]> {
    return this._networkService.getNetworks(query).pipe(
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