import { JsonProperty } from 'json-object-mapper';
import {
  OrderType,
  OrderTypeSerialization
} from '../enumerations/order-type.enum';
import { McsEntityBase } from '../mcs-entity.base';

export class McsOrderItemType extends McsEntityBase {
  public typeId: string;
  public name: string;
  public description: string;
  public productId: string;
  public realtimeProvisioningSupport: boolean;
  public parameters: any[];

  @JsonProperty({
    type: OrderType,
    serializer: OrderTypeSerialization,
    deserializer: OrderTypeSerialization
  })
  public orderType: OrderType;

  constructor() {
    super();
    this.typeId = undefined;
    this.name = undefined;
    this.description = undefined;
    this.productId = undefined;
    this.realtimeProvisioningSupport = undefined;
    this.parameters = undefined;
  }
}
