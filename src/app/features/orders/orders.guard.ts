import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { McsNavigationService } from '@app/core';
import { RouteKey } from '@app/models';

@Injectable()
export class OrdersGuard implements CanActivate {

  constructor(private _navigationService: McsNavigationService) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    this._navigationService.navigateTo(RouteKey.OrdersHistory);
    return false;
  }
}
