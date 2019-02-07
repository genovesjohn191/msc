import { RouteCategory } from './enumerations/route-category.enum';

export class McsRouteDetails {
  public url?: string;
  public documentTitle?: string;
  public category?: RouteCategory;
  public requiredPermissions?: string[];
  public featureFlag?: string;
}
