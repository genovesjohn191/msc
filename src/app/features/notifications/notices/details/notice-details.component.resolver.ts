import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {
  McsApiErrorContext,
  McsNotice
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class NoticeDetailsResolver implements Resolve<McsNotice> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getNotice(route.paramMap.get('id')).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
