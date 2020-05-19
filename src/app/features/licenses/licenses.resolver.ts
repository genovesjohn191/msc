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
  McsLicense,
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class LicensesResolver implements Resolve<McsLicense[]> {

  constructor(private _apiService: McsApiService) { }

  public resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getLicenses().pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
