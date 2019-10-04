import { JsonProperty } from '@peerlancers/json-serialization';
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
  WorkflowStatusSerialization,
  workflowStatusText
} from '../enumerations/workflow-status.enum';
import { McsJob } from './mcs-job';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsOrderItem } from './mcs-order-item';
import { McsOrderCharge } from './mcs-order-charge';
import { McsOrderError } from './mcs-order-error';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsOrder extends McsEntityBase {
  @JsonProperty()
  public orderId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public contractDurationMonths: number = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty()
  public itemCount: number = undefined;

  @JsonProperty()
  public errorCount: number = undefined;

  @JsonProperty({
    serializer: WorkflowStatusSerialization,
    deserializer: WorkflowStatusSerialization
  })
  public workflowState: WorkflowStatus = undefined;

  @JsonProperty({
    serializer: OrderStatusSerialization,
    deserializer: OrderStatusSerialization
  })
  public status: OrderStatus = undefined;

  @JsonProperty({
    serializer: OrderOriginSerialization,
    deserializer: OrderOriginSerialization
  })
  public origin: OrderOrigin = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public modifiedBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public modifiedOn: Date = undefined;

  @JsonProperty({ target: McsOrderCharge })
  public charges: McsOrderCharge = undefined;

  @JsonProperty({ target: McsOrderItem })
  public items: McsOrderItem[] = undefined;

  @JsonProperty({ target: McsOrderError })
  public errors: McsOrderError[] = undefined;

  @JsonProperty({ target: McsJob })
  public jobs: McsJob[] = undefined;

  /**
   * Returns the progress description of the order
   */
  public get progressDescription(): string {
    return `Progress - Order ${this.orderId}`;
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
   * Returns the workflow status label
   */
  public get workflowStatusLabel(): string {
    return workflowStatusText[this.workflowState];
  }

  /**
   * Returns the order origin label
   */
  public get originLabel(): string {
    return orderOriginText[this.origin];
  }

  /**
   * Returns true when the order can be submitted
   */
  public get canBeSubmitted(): boolean {
    return this.workflowState === WorkflowStatus.Incomplete ||
      this.workflowState === WorkflowStatus.Draft ||
      this.workflowState === WorkflowStatus.AwaitingApproval;
  }

  /**
   * Returns true when the order requires approval
   */
  public get requiresApproval(): boolean {
    return this.workflowState === WorkflowStatus.Incomplete ||
      this.workflowState === WorkflowStatus.Draft;
  }

  /**
   * Returns true when the order is cancellable
   */
  public get cancellable(): boolean {
    return this.workflowState === WorkflowStatus.Incomplete ||
      this.workflowState === WorkflowStatus.Draft;
  }

  /**
   * Returns true when the order is rejectable
   */
  public get rejectable(): boolean {
    return this.workflowState === WorkflowStatus.AwaitingApproval;
  }
}
