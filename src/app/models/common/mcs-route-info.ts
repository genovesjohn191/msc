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
  public requiredFeatureFlags?: string[];
  public requireAllFeatures: boolean = false;
  public requiredPermissions?: string[];
  public requreAllPermissions: boolean = false;
  public urlAfterRedirects?: string;
}
