import {
  McsRouteKey,
  McsRouteCategory
} from '@app/models';

export class McsRouteInfo {
  public enumCategory?: McsRouteCategory;
  public enumKey?: McsRouteKey;
  public navigationPath?: string;
  public routePath?: string;
  public documentTitle?: string;
  public requiredFeatureFlag?: string;
  public requiredPermissions?: string[];
}
