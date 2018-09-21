import { McsRouteCategory } from '@app/models';

export class McsRouteDetails {
  public url?: string;
  public documentTitle?: string;
  public category?: McsRouteCategory;
  public requiredPermissions?: string[];
  public featureFlag?: string;
}
