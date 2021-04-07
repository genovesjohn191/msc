import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import {
  McsAuthenticationIdentity,
  McsErrorHandlerService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { HttpStatusCode } from '@app/models';

@Injectable()
export class LaunchPadGuard implements CanActivate {

  constructor(
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _errorHandlerService: McsErrorHandlerService,
    private _eventDispatcher: EventBusDispatcherService,
  ) {
    this._updateOnCompanySwitch();
  }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (this._authenticationIdentity.isImpersonating) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
    }

    return !this._authenticationIdentity.isImpersonating;
  }

  private _updateOnCompanySwitch(): void {
    this._eventDispatcher.addEventListener(McsEvent.accountChange, () => {
      if (this._authenticationIdentity.isImpersonating) {
        this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
      }
    });
  }
}
