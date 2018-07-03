import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map
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
        map((response) => response as NetworkingModel[])
      );
  }
}
