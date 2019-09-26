import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsConsole extends McsEntityBase {
  @JsonProperty()
  public url: string = undefined;

  @JsonProperty()
  public vmx: string = undefined;
}
