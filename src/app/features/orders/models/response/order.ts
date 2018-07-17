import { JsonProperty } from 'json-object-mapper';
import {
  McsEntityBase,
  McsDateSerialization,
  McsApiJob
} from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';
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
import { OrderItem } from './order-item';
import { OrderCharge } from './order-charge';
import { OrderError } from './order-error';

export class Order extends McsEntityBase {
  public orderId: string;
  public description: string;
  public companyId: string;
  public createdBy: string;
  public itemCount: number;
  public errorCount: number;

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

  @JsonProperty({ type: OrderCharge })
  public charges: OrderCharge;

  @JsonProperty({ type: OrderItem })
  public items: OrderItem[];

  @JsonProperty({ type: OrderError })
  public errors: OrderError[];

  @JsonProperty({ type: McsApiJob })
  public jobs: McsApiJob[];

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
