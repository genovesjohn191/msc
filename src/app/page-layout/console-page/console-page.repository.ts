import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsApiConsole
} from '../../core';
import { ConsolePageService } from './console-page.service';

@Injectable()
export class ConsolePageRepository extends McsRepositoryBase<McsApiConsole> {

  constructor(private _consoleApiService: ConsolePageService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(): Observable<McsApiSuccessResponse<McsApiConsole[]>> {
    return Observable.of(undefined);
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsApiConsole>> {
    // Clear the record for each call to remove the caching
    this.clearRecords();
    return this._consoleApiService.getServerConsole(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
