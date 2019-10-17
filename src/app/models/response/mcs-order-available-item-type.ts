import { JsonProperty } from '@peerlancers/json-serialization';
import {
  OrderType,
  OrderTypeSerialization
} from '../enumerations/order-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderAvailableItemType extends McsEntityBase {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty({
    serializer: OrderTypeSerialization,
    deserializer: OrderTypeSerialization
  })
  public orderType: OrderType = undefined;

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
}
