import { isNullOrEmpty, containsString } from '../utilities';
import { McsRouteKey } from './enumerations/mcs-route-key.enum';
import { McsRouteInfo } from './models/mcs-route-info';
import { McsRouteCategory } from './enumerations/mcs-route-category.enum';

export class CoreRoutes {
  /**
   * Returns the route path of the given router key
   * @param keyPath Router key from where the path will be obtained
   *
   * `@Note`: This will automatically removed the :id url
   */
  public static getPath(keyPath: McsRouteKey): string {
    this._createRoutePathTable();
    let pathNotExist = !this._routePathTable.has(keyPath);
    if (pathNotExist) { throw new Error(`Key path was not registered: ${McsRouteKey[keyPath]}`); }

    return this._routePathTable.get(keyPath).routePath;
  }

  /**
   * Returns the route information based on the url given
   * @param fullUrl Url to be served as the basis of the route
   */
  public static getRouteInfoByUrl(fullUrl: string): McsRouteInfo {
    this._createRoutePathTable();
    if (isNullOrEmpty(fullUrl)) { return undefined; }
    let routeInfoFound: McsRouteInfo;

    this._routePathTable.forEach((_route) => {
      if (!isNullOrEmpty(routeInfoFound)) { return; }
      let routePath = _route.routePath.slice().replace('/:id', '');

      let routePathMatched = containsString(fullUrl, routePath) &&
        containsString(fullUrl, _route.referenceRoutePath);
      if (routePathMatched) { routeInfoFound = _route; }
    });
    return routeInfoFound;
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
      routeInfo.referenceRoutePath = jsonRouteInfo.referenceRoutePath;
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
