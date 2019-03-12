import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import {
  OrderStatus,
  OrderStatusSerialization,
  orderStatusText
} from '../enumerations/order-status.enum';
import {
  ProvisioningStatus,
  ProvisioningStatusSerialization
} from '../enumerations/provisioning-status.enum';
import { McsEntityBase } from '../mcs-entity.base';
import { McsOrderCharge } from './mcs-order-charge';

export class McsOrderItem extends McsEntityBase {
  @JsonProperty({
    type: ProvisioningStatus,
    serializer: ProvisioningStatusSerialization,
    deserializer: ProvisioningStatusSerialization
  })
  public itemProvisioningStatus: ProvisioningStatus;
  public automatedProvisioningAvailable: boolean;
  public referenceId: string;
  public parentReferenceId: string;
  public itemId: string;
  public itemOrderTypeId: string;
  public parentServiceId: string;

  @JsonProperty({
    type: OrderStatus,
    serializer: OrderStatusSerialization,
    deserializer: OrderStatusSerialization
  })
  public status: OrderStatus;

  public description: string;
  public createdBy: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;
  public modifiedBy: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public modifiedOn: Date;

  @JsonProperty({ type: McsOrderCharge })
  public charges: McsOrderCharge;

  public properties: any;
  public jobId: string;
  public taskId: string;
  public serviceId: string;

  constructor() {
    super();
    this.automatedProvisioningAvailable = undefined;
    this.charges = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
    this.description = undefined;
    this.id = undefined;
    this.itemOrderTypeId = undefined;
    this.itemProvisioningStatus = undefined;
    this.jobId = undefined;
    this.modifiedBy = undefined;
    this.modifiedOn = undefined;
    this.itemId = undefined;
    this.parentReferenceId = undefined;
    this.parentServiceId = undefined;
    this.properties = undefined;
    this.referenceId = undefined;
    this.serviceId = undefined;
    this.status = undefined;
    this.taskId = undefined;
  }

  /**
   * Returns the order status label
   */
  public get statusLabel(): string {
    return orderStatusText[this.status];
  }
}
