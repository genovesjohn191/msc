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
  McsCatalog
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class CatalogResolver implements Resolve<McsCatalog> {

  constructor(private _apiService: McsApiService) { }

  public resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getCatalog().pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
