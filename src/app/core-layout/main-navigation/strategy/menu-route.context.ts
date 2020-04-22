import { Injector } from '@angular/core';
import {
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import { RouteCategory } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import {
  menuRouteMap,
  SubMenuRouteDetails
} from './menu-route.map';

export class MenuRouteContext {
  private _subMenuRouteDetails: SubMenuRouteDetails[] = [];
  private readonly _accessControlService: McsAccessControlService;
  private readonly _navigationService: McsNavigationService;

  constructor(private _injector: Injector) {
    this._accessControlService = this._injector.get(McsAccessControlService);
    this._navigationService = this._injector.get(McsNavigationService);
  }

  public setRouteCategory(category: RouteCategory): void {
    if (!menuRouteMap.has(category)) {
      throw new Error(`Unable to find default route for type ${category}.
        Please make sure you've registered the type in the menu route map`);
    }
    this._subMenuRouteDetails = menuRouteMap.get(category);
  }

  public navigateToDefaultMenu(): void {
    let validDefaultRouteDetails = this._subMenuRouteDetails.find((routeDetails: SubMenuRouteDetails) =>
      this._accessControlService.hasAccess(routeDetails.permission, routeDetails.featureFlag)
    );

    if (isNullOrEmpty(validDefaultRouteDetails)) { return; }
    this._navigationService.navigateTo(validDefaultRouteDetails.routeKey);
  }
}
