import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  McsSystemMessageEdit,
  McsApiErrorContext
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class SystemMessageResolver implements Resolve<McsSystemMessageEdit> {
  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getSystemMessage(route.paramMap.get('id')).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
