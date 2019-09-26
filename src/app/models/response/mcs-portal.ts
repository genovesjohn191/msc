import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsPortalAccess } from './mcs-portal-access';

export class McsPortal extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public resourceSpecific: boolean = undefined;

  @JsonProperty({ target: McsPortalAccess })
  public portalAccess: McsPortalAccess[] = undefined;
}
