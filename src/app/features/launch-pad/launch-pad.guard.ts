import { ChangeDetectorRef, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { McsAuthenticationIdentity, McsErrorHandlerService } from '@app/core';
import { HttpStatusCode } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

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
