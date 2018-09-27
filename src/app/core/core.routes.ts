import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsRouteInfo,
  RouteCategory
} from '@app/models';

export class CoreRoutes {
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
   * Returns the route path of the given router key
   * @param keyPath Router key from where the path will be obtained
   */
  public static getRoutePath(keyPath: RouteKey): string {
    return this.getRouteInfoByKey(keyPath).routePath;
  }

  /**
   * Returns the navigation path of the route key
   * @param keyPath Router key from where the path will be obtained
   */
  public static getNavigationPath(keyPath: RouteKey): string {
    return this.getRouteInfoByKey(keyPath).navigationPath;
  }

  private static _routePathTable: Map<RouteKey, McsRouteInfo>;

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

      routeInfo.enumCategory = jsonRouteInfo.enumCategory &&
        +RouteCategory[jsonRouteInfo.enumCategory];
      routeInfo.enumKey = jsonRouteInfo.enumKey &&
        +RouteKey[jsonRouteInfo.enumKey];
      routeInfo.navigationPath = jsonRouteInfo.navigationPath;
      routeInfo.routePath = jsonRouteInfo.routePath;
      routeInfo.documentTitle = jsonRouteInfo.documentTitle;
      routeInfo.requiredPermissions = jsonRouteInfo.requiredPermissions;
      routeInfo.requiredFeatureFlag = jsonRouteInfo.requiredFeatureFlag;
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
