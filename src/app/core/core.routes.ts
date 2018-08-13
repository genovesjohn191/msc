import { isNullOrEmpty } from '../utilities';
import { McsRouteKey } from './enumerations/mcs-route-key.enum';
import { McsRouteInfo } from './models/mcs-route-info';
import { McsRouteCategory } from './enumerations/mcs-route-category.enum';

export class CoreRoutes {
  /**
   * Gets the route information based on the key provided
   * @param keyPath Router key from where the router information will be extracted
   */
  public static getRouteInfoByKey(keyPath: McsRouteKey): McsRouteInfo {
    this._createRoutePathTable();
    let pathNotExist = !this._routePathTable.has(keyPath);
    if (pathNotExist) {
      throw new Error(`Key path was not registered: ${McsRouteKey[keyPath]}`);
    }
    return this._routePathTable.get(keyPath);
  }

  /**
   * Returns the route path of the given router key
   * @param keyPath Router key from where the path will be obtained
   */
  public static getRoutePath(keyPath: McsRouteKey): string {
    return this.getRouteInfoByKey(keyPath).routePath;
  }

  /**
   * Returns the navigation path of the route key
   * @param keyPath Router key from where the path will be obtained
   */
  public static getNavigationPath(keyPath: McsRouteKey): string {
    return this.getRouteInfoByKey(keyPath).navigationPath;
  }

  private static _routePathTable: Map<McsRouteKey, McsRouteInfo>;

  /**
   * Creates the route path table
   *
   * `@Note` This would only execute once the route path table has been populated
   */
  private static _createRoutePathTable(): void {
    if (!isNullOrEmpty(this._routePathTable)) { return; }
    this._routePathTable = new Map<McsRouteKey, McsRouteInfo>();
    let routeConfig = this._loadRouteConfig();

    Object.keys(routeConfig).forEach((key) => {
      let jsonRouteInfo = routeConfig[key];
      let routeInfo = new McsRouteInfo();

      routeInfo.enumCategory = jsonRouteInfo.enumCategory &&
        +McsRouteCategory[jsonRouteInfo.enumCategory];
      routeInfo.enumKey = jsonRouteInfo.enumKey &&
        +McsRouteKey[jsonRouteInfo.enumKey];
      routeInfo.navigationPath = jsonRouteInfo.navigationPath;
      routeInfo.routePath = jsonRouteInfo.routePath;
      routeInfo.documentTitle = jsonRouteInfo.documentTitle;
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
