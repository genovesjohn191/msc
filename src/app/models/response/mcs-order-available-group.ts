import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailableItemType } from './mcs-order-available-item-type';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  OrderAvailableGroupType,
  OrderAvailableGroupTypeSerialization
} from '../enumerations/order-available-group-type.enum';

export class McsOrderAvailableGroup extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: OrderAvailableGroupTypeSerialization,
    deserializer: OrderAvailableGroupTypeSerialization
  })
  public type: OrderAvailableGroupType = undefined;

  @JsonProperty({
    target: McsOrderAvailableItemType
  })
  public orderAvailableItemTypes: McsOrderAvailableItemType[] = undefined;
}
