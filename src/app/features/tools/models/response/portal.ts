import { JsonProperty } from 'json-object-mapper';
import { PortalAccess } from './portal.access';
import { McsEntityBase } from '../../../../core';

export class Portal extends McsEntityBase {
  public name: string;
  public resourceSpecific: boolean;

  @JsonProperty({ type: PortalAccess })
  public portalAccess: PortalAccess[];

  constructor() {
    super();
    this.name = undefined;
    this.resourceSpecific = undefined;
    this.portalAccess = undefined;
  }
}
