import { JsonProperty } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  OrderWorkflowAction,
  OrderWorkflowActionSerialization
} from '../enumerations/order-workflow-action.enum';

export interface IMcsOrderWorkflowRefObj {
  resourceDescription: string;
  serviceId?: string;
  serverId?: string;
}

export class McsOrderWorkflow extends McsApiJobRequestBase<IMcsOrderWorkflowRefObj> {
  @JsonProperty({
    type: OrderWorkflowAction,
    serializer: OrderWorkflowActionSerialization,
    deserializer: OrderWorkflowActionSerialization
  })
  public state: OrderWorkflowAction;
  public approvers?: string[];

  constructor() {
    super();
    this.state = undefined;
    this.approvers = undefined;
  }
}
