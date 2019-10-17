import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailableFamily } from './mcs-order-available-family';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailablePlatform extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty({
    target: McsOrderAvailableFamily
  })
  public families: McsOrderAvailableFamily[] = undefined;
}
