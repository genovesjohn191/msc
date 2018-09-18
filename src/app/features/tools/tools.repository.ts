import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { ToolsService } from './tools.service';
import { Portal } from './models';
import { isNullOrEmpty } from 'app/utilities';

@Injectable()
export class ToolsRepository extends McsRepositoryBase<Portal> {

  constructor(private _toolsApiService: ToolsService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(): Observable<McsApiSuccessResponse<Portal[]>> {
    return this._toolsApiService.getPortals();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Portal>> {
    let apiRecord = new McsApiSuccessResponse<Portal>();
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
