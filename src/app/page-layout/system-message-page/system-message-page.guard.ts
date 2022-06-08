import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';
import {
  McsAccessControlService,
  McsNavigationService,
  McsSystemMessageService
} from '@app/core';
import { McsFeatureFlag } from '@app/models';

@Injectable()
export class McsSystemMessagePageGuard implements CanActivate {

  constructor(
    private _systemMessageService: McsSystemMessageService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._systemMessageService.activeMessage().pipe(
      map((response) => {
        let isMessageCritical = getSafeProperty(response,
          (message) => message.isCritical, false);
        return isMessageCritical;
      })
    );
  }
}
