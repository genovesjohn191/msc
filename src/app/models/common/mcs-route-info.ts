import { RouteCategory } from '../enumerations/route-category.enum';
import { RouteKey } from '../enumerations/route-key.enum';
import { RoutePlatform } from '../enumerations/route-platform.enum';

export class McsRouteInfo {
  public enumPlatform?: RoutePlatform;
  public enumCategory?: RouteCategory;
  public enumKey?: RouteKey;
  public navigationPath?: string;
  public routePath?: string;
  public documentTitle?: string;
  public requiredFeatureFlag?: string;
  public requiredPermissions?: string[];
  public urlAfterRedirects?: string;
}
