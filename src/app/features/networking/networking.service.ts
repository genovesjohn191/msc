import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

// Services Declarations
import {
  McsApiService,
  McsApiRequestParameter
} from '../../core/';

// Models
import { NetworkingModel } from './networking.model';

@Injectable()
export class NetworkingService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get Lead Description Data
   */
  public getLeadDescription(): Observable<NetworkingModel[]> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/marketo/leads/describe/';

    return this._mcsApiService
      .get(mcsApiRequestParameter)
      .map((response) => response.json().result as NetworkingModel[])
      .catch(this.handleError);
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  private handleError(error: Response | any) {
    // TODO: Refactor during actual development
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    return Observable.throw(errMsg);
  }
}
