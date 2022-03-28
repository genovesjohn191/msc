import {
  of,
  Observable
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {
  McsApiErrorContext,
  McsNetworkDbVlan
} from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class NetworkVlanResolver implements Resolve<McsNetworkDbVlan> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<McsNetworkDbVlan> {
    let vlanId = route.paramMap.get('id');
    if (isNullOrEmpty(vlanId)) { return of(null); }

    return this._apiService.getNetworkDbVlan(+vlanId).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
