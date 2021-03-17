import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { McsAuthenticationGuard } from '@app/core';
import { McsApiService } from '@app/services';

@Injectable()
export class CatalogPageGuard implements CanActivate {

  constructor(
    private _apiService: McsApiService,
    private _defaultAuthGuard: McsAuthenticationGuard
  ) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ) {

    return this._apiService.getIdentity().pipe(
      switchMap(identity => {
        if (identity?.isAnonymous) { return of(true); }
        return this._defaultAuthGuard.canActivate(_activatedRoute, _routerState);
      })
    );
  }
}
