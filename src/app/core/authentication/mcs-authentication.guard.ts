import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  Router,
  NavigationEnd
} from '@angular/router';
import { McsAuthenticationService } from './mcs-authentication.service';
import { CoreDefinition } from '../core.definition';
import { AppState } from '../../app.service';

@Injectable()
export class McsAuthenticationGuard implements CanActivate {
  constructor(
    private _authenticationService: McsAuthenticationService,
    private _router: Router,
    private _appState: AppState) {
   }

  public canActivate(
    _activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot,
  ) {
    this._setReturnUrl(_routerState);

    return this._authenticationService.IsAuthenticated();
  }

  private _setReturnUrl(_routerState: RouterStateSnapshot) {
    this._appState.set(CoreDefinition.APPSTATE_RETURN_URL_KEY, _routerState.url);
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._appState.set(CoreDefinition.APPSTATE_RETURN_URL_KEY, event.url);
      }
    });
  }
}
