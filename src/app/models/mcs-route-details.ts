import { RouteCategory } from '@app/models';

export class McsRouteDetails {
  public url?: string;
  public documentTitle?: string;
  public category?: RouteCategory;
  public requiredPermissions?: string[];
  public featureFlag?: string;
}
