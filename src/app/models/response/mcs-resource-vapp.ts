import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceVApp extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;
}
