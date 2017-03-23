import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services */
import { McsApiService } from '../../core/';
/** Models */
import { Server } from './server';

@Injectable()
export class ServersService {

  constructor(private _mcsApiService: McsApiService) {}

  public getServers(): Observable<Server[]> {
    return this._mcsApiService.get('/servers')
    .map((response) => response.json().content as Server[]);
  }
}
