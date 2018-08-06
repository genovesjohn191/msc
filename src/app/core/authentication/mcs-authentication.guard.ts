import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { McsAuthenticationService } from './mcs-authentication.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {
  constructor( private _authenticationService: McsAuthenticationService) {
   }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot
  ) {
    return this._authenticationService.IsAuthenticated();
  }
}
