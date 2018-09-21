import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsPortal
} from '@app/models';
import { ToolsService } from './tools.service';

@Injectable()
export class ToolsRepository extends McsRepositoryBase<McsPortal> {

  constructor(private _toolsApiService: ToolsService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(): Observable<McsApiSuccessResponse<McsPortal[]>> {
    return this._toolsApiService.getPortals();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsPortal>> {
    let apiRecord = new McsApiSuccessResponse<McsPortal>();
    let portalRecord = this.dataRecords.find((result) => {
      return result.name === recordId;
    });
    if (!isNullOrEmpty(portalRecord)) {
      apiRecord.content = portalRecord;
      apiRecord.totalCount = 1;
    }
    return of(apiRecord);
  }
}
