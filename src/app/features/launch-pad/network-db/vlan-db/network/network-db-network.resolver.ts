import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsApiErrorContext,
  McsNetworkDbNetwork
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class NetworkDbNetworkDetailsResolver implements Resolve<McsNetworkDbNetwork> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<McsNetworkDbNetwork> {
    return this._apiService.getNetworkDbNetwork(route.paramMap.get('id'))
    .pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
