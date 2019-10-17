import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailableItemType } from './mcs-order-available-item-type';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailableGroup extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty({
    target: McsOrderAvailableItemType
  })
  public availableOrderItemTypes: McsOrderAvailableItemType[] = undefined;
}
