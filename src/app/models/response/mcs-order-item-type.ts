import { JsonProperty } from 'json-object-mapper';
import {
  OrderType,
  OrderTypeSerialization
} from '../enumerations/order-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderItemType extends McsEntityBase {
  public elementCode: string;
  public productCode: string;

  @JsonProperty({
    type: OrderType,
    serializer: OrderTypeSerialization,
    deserializer: OrderTypeSerialization
  })
  public orderType: OrderType;

  public orderChangeType: string;
  public productId: string;
  public productOrderType: string;
  public automatedProvisioningAvailable: true;
  public description: string;
  public provisioningEndpoint: string;

  constructor() {
    super();
    this.automatedProvisioningAvailable = undefined;
    this.description = undefined;
    this.elementCode = undefined;
    this.orderChangeType = undefined;
    this.orderType = undefined;
    this.productCode = undefined;
    this.productId = undefined;
    this.productOrderType = undefined;
    this.provisioningEndpoint = undefined;
  }
}
