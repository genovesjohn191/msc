import { Injectable } from '@angular/core';
import {
  Router,
  NavigationExtras
} from '@angular/router';
import { RouteKey } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { LogClass } from '@peerlancers/ngx-logger';
import { CoreRoutes } from '../core.routes';

@Injectable()
@LogClass()
export class McsNavigationService {

  constructor(private _router: Router) { }

  /**
   * Navigates to routekey navigation path definition
   * @param routeKey Routekey to where it navigates
   * @param additionalPaths additional routes to be appended on the url
   */
  public navigateTo(routeKey: RouteKey, additionalPaths?: string[]): void;

  /**
   * Navigates to routekey definition
   * @param routeKey Routekey to be navigated
   * @param additionalPaths additional routes to be appended on the url
   * @param extras Extras of the route
   */
  public navigateTo(routeKey: RouteKey, additionalPaths?: string[], extras?: NavigationExtras): void;
  public navigateTo(routeKey: RouteKey, additionalPaths?: string[], extras?: NavigationExtras): void {
    if (isNullOrUndefined(additionalPaths)) { additionalPaths = []; }

    isNullOrEmpty(extras) ?
      this._router.navigate([CoreRoutes.getNavigationPath(routeKey), ...additionalPaths]) :
      this._router.navigate([CoreRoutes.getNavigationPath(routeKey), ...additionalPaths], extras);
  }

  /**
   * Navigates to absolute path
   * @param routePath Route path to where it navigates
   * @param extras Navigation options
   */
  public navigateRoot(routePath: string, extras?: NavigationExtras): void {
    this._router.navigateByUrl(routePath, extras);
  }
}
