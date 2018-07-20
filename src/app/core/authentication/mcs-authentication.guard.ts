import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { map } from 'rxjs/operators';
import { CoreConfig } from '../core.config';
import { McsAuthenticationService } from './mcs-authentication.service';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {
  constructor(
    private _authenticationService: McsAuthenticationService,
    private _coreConfig: CoreConfig
  ) { }

  public canActivate(
    activatedRoute: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ) {
    // Set Return URL always
    this._authenticationService.setReturnUrl(routerState.url, activatedRoute.queryParams);

    // Get the JWT Token from header
    this._trySetJwtFromQueryParams(activatedRoute);

    return this._authenticationService.IsAuthenticated()
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  private _trySetJwtFromQueryParams(activatedRoute: ActivatedRouteSnapshot) {
    if (!this._coreConfig.enablePassingJwtInUrl) {
      return;
    }

    let headerToken: any = activatedRoute.queryParams;
    let authToken: string = this._authenticationService.getAuthToken(headerToken);

    if (!isNullOrEmpty(authToken)) {
      this._authenticationService.setAuthToken(authToken);
    }
  }
}
