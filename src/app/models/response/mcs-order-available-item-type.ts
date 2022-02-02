import { JsonProperty } from '@app/utilities';
import {
  ItemType,
  ItemTypeSerialization
} from '../enumerations/item-type.enum';
import {
  OrderAvailabilityState,
  OrderAvailabilityStateSerialization
} from '../enumerations/order-availability-state.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailableItemType extends McsEntityBase {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty({
    serializer: ItemTypeSerialization,
    deserializer: ItemTypeSerialization
  })
  public itemType: ItemType = undefined;

  @JsonProperty()
  public productOrderType: string = undefined;

  @JsonProperty()
  public orderName: string = undefined;

  @JsonProperty()
  public orderAction: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public automatedProvisioningAvailable: boolean = undefined;

  @JsonProperty()
  public icon: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty()
  public standardLeadTimeHours: number = undefined;

  @JsonProperty()
  public acceleratedLeadTimeHours: number = undefined;

  @JsonProperty({
    serializer: OrderAvailabilityStateSerialization,
    deserializer: OrderAvailabilityStateSerialization
  })
  public availabilityState: OrderAvailabilityState = undefined;
}
