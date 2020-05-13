import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsPlatform extends McsEntityBase {
  @JsonProperty()
  public hasPrivateCloud: boolean = undefined;

  @JsonProperty()
  public hasPublicCloud: boolean = undefined;
}
