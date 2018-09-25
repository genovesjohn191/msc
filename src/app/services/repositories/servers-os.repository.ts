import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsServerOperatingSystem
} from '@app/models';
import { ServersApiService } from '../api-services/servers-api.service';

@Injectable()
export class ServersOsRepository extends McsRepositoryBase<McsServerOperatingSystem> {

  constructor(private _serversApiService: ServersApiService) {
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
  ): Observable<McsApiSuccessResponse<McsServerOperatingSystem[]>> {
    return this._serversApiService.getServerOs();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @ignore This would be ignore since server operating system doesnt have uuid in API
   * @param recordId Record id to find
   */
  protected getRecordById(_recordId: string):
    Observable<McsApiSuccessResponse<McsServerOperatingSystem>> {
    return of(undefined);
  }
}
