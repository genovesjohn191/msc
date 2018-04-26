import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { ServersService } from './servers.service';
import { ServerOperatingSystem } from './models';

@Injectable()
export class ServersOsRepository extends McsRepositoryBase<ServerOperatingSystem> {

  constructor(private _serversApiService: ServersService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    _pageIndex: number,
    _pageSize: number,
    _keyword: string
  ): Observable<McsApiSuccessResponse<ServerOperatingSystem[]>> {
    return this._serversApiService.getServerOs();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @ignore This would be ignore since server operating system doesnt have uuid in API
   * @param recordId Record id to find
   */
  protected getRecordById(_recordId: string):
    Observable<McsApiSuccessResponse<ServerOperatingSystem>> {
    return Observable.of(undefined);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}