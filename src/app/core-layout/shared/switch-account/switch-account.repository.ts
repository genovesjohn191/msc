import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  McsApiCompany,
  McsApiSuccessResponse
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { Observable } from 'rxjs/Rx';
import { SwitchAccountService } from './switch-account.service';

@Injectable()
export class SwitchAccountRepository extends McsRepositoryBase<McsApiCompany> {

  constructor(private _switchAccountService: SwitchAccountService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    recordCount: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsApiCompany[]>> {
    return this._switchAccountService.getCompanies({
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
    let apiRecord = new McsApiSuccessResponse<McsApiCompany>();
    let companyRecord = this.dataRecords.find((data) => {
      return data.id === recordId;
    });
    if (!isNullOrEmpty(companyRecord)) {
      apiRecord.content = companyRecord;
      apiRecord.totalCount = 1;
    }
    return Observable.of(apiRecord);
  }
}
