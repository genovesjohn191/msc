import { of } from 'rxjs';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import {
  McsAccessControlService,
  McsAuthenticationGuard
} from '@app/core';

@Injectable()
export class CatalogPageGuard implements CanActivate {

  constructor(
    private _accesscontrolService: McsAccessControlService,
    private _defaultAuthGuard: McsAuthenticationGuard
  ) { }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ) {
    if (this._accesscontrolService.hasAccessToCatalog) {
      return of(true);
    }
    return this._defaultAuthGuard.canActivate(_activatedRoute, _routerState);
  }
}
