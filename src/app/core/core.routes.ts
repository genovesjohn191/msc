import { isNullOrEmpty, coerceArray } from '@app/utilities';
import {
  RouteKey,
  McsRouteInfo,
  RouteCategory,
  RoutePlatform
} from '@app/models';

export class CoreRoutes {
  private static _routePathTable: Map<RouteKey, McsRouteInfo>;

  /**
   * Gets the route information based on the key provided
   * @param keyPath Router key from where the router information will be extracted
   */
  public static getRouteInfoByKey(keyPath: RouteKey): McsRouteInfo {
    this._createRoutePathTable();
    let pathNotExist = !this._routePathTable.has(keyPath);
    if (pathNotExist) {
      throw new Error(`Key path was not registered: ${RouteKey[keyPath]}`);
    }
    return this._routePathTable.get(keyPath);
  }

  /**
   * Returns the navigation path of the route key
   * @param keyPath Router key from where the path will be obtained
   */
  public static getNavigationPath(keyPath: RouteKey): string {
    return this.getRouteInfoByKey(keyPath).navigationPath;
  }

  /**
   * Creates the route path table
   *
   * `@Note` This would only execute once the route path table has been populated
   */
  private static _createRoutePathTable(): void {
    if (!isNullOrEmpty(this._routePathTable)) { return; }
    this._routePathTable = new Map<RouteKey, McsRouteInfo>();
    let routeConfig = this._loadRouteConfig();

    Object.keys(routeConfig).forEach((key) => {
      let jsonRouteInfo = routeConfig[key];
      let routeInfo = new McsRouteInfo();

      routeInfo.enumPlatform = jsonRouteInfo.enumPlatform &&
        +RoutePlatform[jsonRouteInfo.enumPlatform];
      routeInfo.enumCategory = jsonRouteInfo.enumCategory &&
        +RouteCategory[jsonRouteInfo.enumCategory];
      routeInfo.enumKey = jsonRouteInfo.enumKey &&
        +RouteKey[jsonRouteInfo.enumKey];
      routeInfo.navigationPath = jsonRouteInfo.navigationPath;
      routeInfo.documentTitle = jsonRouteInfo.documentTitle;
      routeInfo.requiredPermissions = jsonRouteInfo.requiredPermissions;
      routeInfo.requreAllPermissions = jsonRouteInfo.requreAllPermissions;
      routeInfo.requiredFeatureFlags = coerceArray(jsonRouteInfo.requiredFeatureFlag);
      routeInfo.requireAllFeatures = jsonRouteInfo.requireAllFeatures;
      this._routePathTable.set(routeInfo.enumKey, routeInfo);
    });
  }

  /**
   * Load the routes configuration
   */
  private static _loadRouteConfig(): any {
    return require('../config/routes.config.json');
  }
}
