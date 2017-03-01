import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

// Services Declarations
import { McsPortalApiService } from '../../core/';

// Models
import { NetworkingModel } from './networking.model';

@Injectable()
export class NetworkingService {

  constructor(private _mcsPortalApiService: McsPortalApiService) {}

  /**
   * Get Lead Description Data
   */
  public getLeadDescription(): Observable<NetworkingModel[]> {
    return this._mcsPortalApiService
      .get('/marketo/leads/describe/')
      .map((response) => response.json().result as NetworkingModel[])
      .catch(this.handleError);
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  private handleError (error: Response | any) {
    // TODO: Refactor during actual development
    // In a real world app, we might use a remote logging infrastructure
    console.error('Error thrown from fusion api networking service.');
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    console.error('MFP Errors: ' + errMsg);
    return Observable.throw(errMsg);
  }
}
