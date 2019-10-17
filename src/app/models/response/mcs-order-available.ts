import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailablePlatform } from './mcs-order-available-platform';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailable extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty({
    target: McsOrderAvailablePlatform
  })
  public platforms: McsOrderAvailablePlatform[] = undefined;
}
