import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsApiCompany,
  McsApiSuccessResponse,
  McsAccessControlService
} from '../../../core';
import { CoreLayoutService } from '../../core-layout.services';

@Injectable()
export class SwitchAccountRepository extends McsRepositoryBase<McsApiCompany> {

  private _hasPermission: boolean;

  constructor(
    private _coreLayoutService: CoreLayoutService,
    private _accessControlService: McsAccessControlService
  ) {
    super();
    if (this._accessControlService.hasPermission(['CompanyView'])) {
      this._hasPermission = true;
    }
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsApiCompany[]>> {
    let emptyResponse = new McsApiSuccessResponse<McsApiCompany[]>();
    emptyResponse.content = [];
    return !this._hasPermission ? of(emptyResponse) :
      this._coreLayoutService.getCompanies({
        page: pageIndex,
        perPage: pageSize,
        searchKeyword: keyword
      });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsApiCompany>> {
    return this._coreLayoutService.getCompany(recordId)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
