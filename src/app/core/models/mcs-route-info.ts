import { McsRouteCategory } from '../enumerations/mcs-route-category.enum';
import { McsRouteKey } from '../enumerations/mcs-route-key.enum';

export class McsRouteInfo {
  public enumCategory?: McsRouteCategory;
  public enumKey?: McsRouteKey;
  public navigationPath?: string;
  public routePath?: string;
  public documentTitle?: string;
  public requiredFeatureFlag?: string;
  public requiredPermissions?: string[];
}
