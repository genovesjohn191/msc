import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsConsole
} from '@app/models';
import { ConsolePageService } from './console-page.service';

@Injectable()
export class ConsolePageRepository extends McsRepositoryBase<McsConsole> {

  constructor(private _consoleApiService: ConsolePageService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(): Observable<McsApiSuccessResponse<McsConsole[]>> {
    return of(undefined);
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsConsole>> {
    // Clear the record for each call to remove the caching
    this.clearRecords();
    return this._consoleApiService.getServerConsole(recordId);
  }
}
