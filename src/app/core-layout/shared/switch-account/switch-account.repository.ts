import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsAccessControlService
} from '@app/core';
import {
  McsCompany,
  McsApiSuccessResponse,
} from '@app/models';
import { CoreLayoutService } from '../../core-layout.services';

@Injectable()
export class SwitchAccountRepository extends McsRepositoryBase<McsCompany> {

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
  ): Observable<McsApiSuccessResponse<McsCompany[]>> {
    let emptyResponse = new McsApiSuccessResponse<McsCompany[]>();
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsCompany>> {
    return this._coreLayoutService.getCompany(recordId)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
