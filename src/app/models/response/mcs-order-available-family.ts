import { JsonProperty } from '@app/utilities';
import { McsOrderAvailableGroup } from './mcs-order-available-group';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  OrderAvailableFamilyType,
  OrderAvailableFamilyTypeSerialization
} from '../enumerations/order-available-family-type.enum';

export class McsOrderAvailableFamily extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: OrderAvailableFamilyTypeSerialization,
    deserializer: OrderAvailableFamilyTypeSerialization
  })
  public type: OrderAvailableFamilyType = undefined;

  @JsonProperty({
    target: McsOrderAvailableGroup
  })
  public groups: McsOrderAvailableGroup[] = undefined;
}
