import { JsonProperty } from '@peerlancers/json-serialization';
import { McsOrderAvailablePlatform } from './mcs-order-available-platform';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  OrderAvailableType,
  OrderAvailableTypeSerialization
} from '../enumerations/order-available-type.enum';

export class McsOrderAvailable extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: OrderAvailableTypeSerialization,
    deserializer: OrderAvailableTypeSerialization
  })
  public type: OrderAvailableType = undefined;

  @JsonProperty({
    target: McsOrderAvailablePlatform
  })
  public platforms: McsOrderAvailablePlatform[] = undefined;
}
