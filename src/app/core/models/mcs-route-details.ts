import { McsRouteCategory } from '../enumerations/mcs-router-category.enum';

export class McsRouteDetails {
  public url?: string;
  public documentTitle?: string;
  public category?: McsRouteCategory;
  public requiredPermissions?: string[];
  public featureFlag?: string;
}
