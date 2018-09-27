import {
  RouteKey,
  RouteCategory
} from '@app/models';

export class McsRouteInfo {
  public enumCategory?: RouteCategory;
  public enumKey?: RouteKey;
  public navigationPath?: string;
  public routePath?: string;
  public documentTitle?: string;
  public requiredFeatureFlag?: string;
  public requiredPermissions?: string[];
}
