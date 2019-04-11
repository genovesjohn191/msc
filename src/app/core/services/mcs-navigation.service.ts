import { Injectable } from '@angular/core';
import {
  Router,
  NavigationExtras
} from '@angular/router';
import { RouteKey } from '@app/models';
import { CoreRoutes } from '../core.routes';

@Injectable()
export class McsNavigationService {

  constructor(private _router: Router) { }

  /**
   * Navigates to routekey navigation path definition
   * @param routeKey Routekey to where it navigates
   * @param params Params of the router key
   */
  public navigateTo(routeKey: RouteKey, ...params: string[]): void {
    this._router.navigate([CoreRoutes.getNavigationPath(routeKey), ...params]);
  }

  /**
   * Navigates to absolute path
   * @param routePath Route path to where it navigates
   * @param extras Navigation options
   */
  public navigateRoot(routePath: string, extras: NavigationExtras): void {
    this._router.navigateByUrl(routePath, extras);
  }
}
