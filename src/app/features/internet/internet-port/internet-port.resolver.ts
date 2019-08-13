import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsApiService } from '@app/services';
import {
  McsInternetPort,
  McsApiErrorContext
} from '@app/models';

@Injectable()
export class InternetPortResolver implements Resolve<McsInternetPort> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<McsInternetPort> {
    return this._apiService.getInternetPort(route.paramMap.get('id')).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
