import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';

export class McsPlatform extends McsEntityBase {
  @JsonProperty()
  public hasPrivateCloud: boolean = undefined;

  @JsonProperty()
  public hasPublicCloud: boolean = undefined;

  @JsonProperty()
  public hasHybridCloud: boolean = undefined;

  @JsonProperty()
  public hasManagedSecurity: boolean = undefined;
}
