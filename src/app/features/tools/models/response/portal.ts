import { PortalAccess } from './portal.access';
import { JsonProperty } from 'json-object-mapper';

export class Portal {
  public name: string;
  public resourceSpecific: boolean;

  @JsonProperty({ type: PortalAccess })
  public portalAccess: PortalAccess[];

  constructor() {
    this.name = undefined;
    this.resourceSpecific = undefined;
    this.portalAccess = undefined;
  }
}
