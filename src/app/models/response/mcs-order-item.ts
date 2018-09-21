import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import {
  OrderStatus,
  OrderStatusSerialization,
  orderStatusText
} from '../enumerations/order-status.enum';
import { McsOrderCharge } from './mcs-order-charge';
import { McsEntityBase } from '../mcs-entity.base';

export class McsOrderItem extends McsEntityBase {
  public referenceId: string;
  public parentReferenceId: string;
  public orderItemId: string;
  public typeId: string;
  public serviceId: string;
  public description: string;
  public properties: any;
  public createdBy: string;
  public modifiedBy: string;

  @JsonProperty({
    type: OrderStatus,
    serializer: OrderStatusSerialization,
    deserializer: OrderStatusSerialization
  })
  public status: OrderStatus;

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

  @JsonProperty({ type: McsOrderCharge })
  public charges: McsOrderCharge;

  constructor() {
    super();
    this.referenceId = undefined;
    this.parentReferenceId = undefined;
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

  /**
   * Returns the order status label
   */
  public get statusLabel(): string {
    return orderStatusText[this.status];
  }
}
