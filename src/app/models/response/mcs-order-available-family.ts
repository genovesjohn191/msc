import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailableGroup } from './mcs-order-available-group';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailableFamily extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty({
    target: McsOrderAvailableGroup
  })
  public groups: McsOrderAvailableGroup[] = undefined;
}
