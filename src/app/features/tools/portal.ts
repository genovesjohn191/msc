import { PortalAccess } from './portal.access';

export class Portal {
  public name: string;
  public resourceSpecific: boolean;
  public portalAccess: PortalAccess[];

  constructor() {
    this.name = undefined;
    this.resourceSpecific = undefined;
    this.portalAccess = undefined;
  }
}
