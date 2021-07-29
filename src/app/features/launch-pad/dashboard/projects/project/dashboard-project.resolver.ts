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
  McsObjectProject
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class DashboardProjectResolver implements Resolve<McsObjectProject> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getProject(route.paramMap.get('id')).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
