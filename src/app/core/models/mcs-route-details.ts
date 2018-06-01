import { McsRouteCategory } from '../enumerations/mcs-router-category.enum';

export class McsRouteDetails {
  public url: string;
  public documentTitle: string;
  public category: McsRouteCategory;
  public requiredPermissions: string[];

  constructor() {
    this.url = undefined;
    this.category = McsRouteCategory.None;
    this.requiredPermissions = new Array();
  }
}
