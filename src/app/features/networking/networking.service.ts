import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  map,
  catchError
} from 'rxjs/operators';

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
      .pipe(
        map((response) => response as NetworkingModel[]),
        catchError(this.handleError)
      );
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  private handleError(error: HttpResponse<any> | any) {
    // TODO: Refactor during actual development
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof HttpResponse) {
      const body = error || '';
      const err = body || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    return Observable.throw(errMsg);
  }
}
