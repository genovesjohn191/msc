import { JsonProperty } from 'json-object-mapper';
import {
  OrderType,
  OrderTypeSerialization
} from '../enumerations/order-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderItemType extends McsEntityBase {
  public elementCode: string = undefined;
  public productCode: string = undefined;

  @JsonProperty({
    type: OrderType,
    serializer: OrderTypeSerialization,
    deserializer: OrderTypeSerialization
  })
  public orderType: OrderType = undefined;

  public orderChangeType: string = undefined;
  public productId: string = undefined;
  public productOrderType: string = undefined;
  public automatedProvisioningAvailable: true = undefined;
  public description: string = undefined;
  public provisioningEndpoint: string = undefined;
}
