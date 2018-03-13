import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  McsApiCompany,
  McsApiSuccessResponse,
  McsAuthenticationService
} from '../../../core';
import { Observable } from 'rxjs/Rx';
import { CoreLayoutService } from '../../core-layout.services';

@Injectable()
export class SwitchAccountRepository extends McsRepositoryBase<McsApiCompany> {

  private _hasPermission: boolean;

  constructor(
    private _coreLayoutService: CoreLayoutService,
    private _authService: McsAuthenticationService
  ) {
    super();
    if (this._authService.hasPermission(['CompanyView'])) {
      this._hasPermission = true;
    }
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    recordCount: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsApiCompany[]>> {
    let emptyResponse = new McsApiSuccessResponse<McsApiCompany[]>();
    emptyResponse.content = [];
    return !this._hasPermission ? Observable.of(emptyResponse) :
      this._coreLayoutService.getCompanies({
        perPage: recordCount,
        searchKeyword: keyword
      });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsApiCompany>> {
    return this._coreLayoutService.getCompany(recordId
    ).map((response) => {
      return response;
    });
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
