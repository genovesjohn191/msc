import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  OrderStatus,
  OrderStatusSerialization,
  orderStatusText
} from '../enumerations/order-status.enum';
import {
  OrderOrigin,
  OrderOriginSerialization,
  orderOriginText
} from '../enumerations/order-origin.enum';
import {
  WorkflowStatus,
  WorkflowStatusSerialization
} from '../enumerations/workflow-status.enum';
import { McsJob } from './mcs-job';
import { McsEntityBase } from '../mcs-entity.base';
import { McsOrderItem } from './mcs-order-item';
import { McsOrderCharge } from './mcs-order-charge';
import { McsOrderError } from './mcs-order-error';

export class McsOrder extends McsEntityBase {
  public orderId: string;
  public description: string;
  public companyId: string;
  public createdBy: string;
  public itemCount: number;
  public errorCount: number;

  @JsonProperty({
    type: WorkflowStatus,
    serializer: WorkflowStatusSerialization,
    deserializer: WorkflowStatusSerialization
  })
  public workflowState: WorkflowStatus;

  @JsonProperty({
    type: OrderStatus,
    serializer: OrderStatusSerialization,
    deserializer: OrderStatusSerialization
  })
  public status: OrderStatus;

  @JsonProperty({
    type: OrderOrigin,
    serializer: OrderOriginSerialization,
    deserializer: OrderOriginSerialization
  })
  public origin: OrderOrigin;

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

  @JsonProperty({ type: McsOrderItem })
  public items: McsOrderItem[];

  @JsonProperty({ type: McsOrderError })
  public errors: McsOrderError[];

  @JsonProperty({ type: McsJob })
  public jobs: McsJob[];

  constructor() {
    super();
    this.orderId = undefined;
    this.description = undefined;
    this.companyId = undefined;
    this.status = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
    this.modifiedBy = undefined;
    this.modifiedOn = undefined;
    this.origin = undefined;
    this.itemCount = undefined;
    this.errorCount = undefined;
    this.charges = undefined;
    this.items = undefined;
    this.errors = undefined;
    this.jobs = undefined;
  }

  /**
   * Returns true when order has errors
   */
  public get hasErrors(): boolean {
    return !isNullOrEmpty(this.errors);
  }

  /**
   * Returns the order status label
   */
  public get statusLabel(): string {
    return orderStatusText[this.status];
  }

  /**
   * Retusn the order origin label
   */
  public get originLabel(): string {
    return orderOriginText[this.origin];
  }
}
