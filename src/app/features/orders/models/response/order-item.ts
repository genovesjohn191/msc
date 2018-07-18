import { JsonProperty } from 'json-object-mapper';
import {
  McsEntityBase,
  McsDateSerialization
} from '../../../../core';
import { OrderCharge } from './order-charge';

export class OrderItem extends McsEntityBase {
  public referenceId: string;
  public orderItemId: string;
  public typeId: string;
  public serviceId: string;
  public status: string;
  public description: string;

  // TODO: Check wheater this properties deserialized the actual model
  public properties: any;
  public createdBy: string;
  public modifiedBy: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public modifiedOn: Date;

  @JsonProperty({ type: OrderCharge })
  public charges: OrderCharge;

  constructor() {
    super();
    this.referenceId = undefined;
    this.orderItemId = undefined;
    this.typeId = undefined;
    this.serviceId = undefined;
    this.status = undefined;
    this.description = undefined;
    this.properties = undefined;
    this.createdBy = undefined;
    this.modifiedBy = undefined;
    this.createdOn = undefined;
    this.modifiedOn = undefined;
    this.charges = undefined;
  }
}
