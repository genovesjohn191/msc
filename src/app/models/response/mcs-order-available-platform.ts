import { JsonProperty } from '@app/utilities';
import { McsOrderAvailableFamily } from './mcs-order-available-family';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  OrderAvailablePlatformType,
  OrderAvailablePlatformTypeSerialization
} from '../enumerations/order-available-platform-type.enum';

export class McsOrderAvailablePlatform extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: OrderAvailablePlatformTypeSerialization,
    deserializer: OrderAvailablePlatformTypeSerialization
  })
  public type: OrderAvailablePlatformType = undefined;

  @JsonProperty({
    target: McsOrderAvailableFamily
  })
  public families: McsOrderAvailableFamily[] = undefined;
}
