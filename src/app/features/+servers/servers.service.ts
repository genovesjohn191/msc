import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  Response,
  URLSearchParams
} from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse
} from '../../core/';
import { Server } from './server';

/**
 * Servers Services Class
 */
@Injectable()
export class ServersService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get Servers (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param serverName Server name filter
   */
  public getServers(
    page?: number,
    perPage?: number,
    serverName?: string): Observable<McsApiSuccessResponse<Server[]>> {

    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('server_name', serverName);

    return this._mcsApiService.get('/servers', undefined, searchParams)
      .map((response) => response.json() as McsApiSuccessResponse<Server[]>);
  }
}
