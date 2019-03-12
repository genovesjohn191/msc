import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsPortalAccess } from './mcs-portal-access';

export class McsPortal extends McsEntityBase {
  public name: string;
  public resourceSpecific: boolean;

  @JsonProperty({ type: McsPortalAccess })
  public portalAccess: McsPortalAccess[];

  constructor() {
    super();
    this.name = undefined;
    this.resourceSpecific = undefined;
    this.portalAccess = undefined;
  }
}
