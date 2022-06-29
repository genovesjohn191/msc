import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  OrderWorkflowAction,
  OrderWorkflowActionSerialization
} from '../enumerations/order-workflow-action.enum';

export interface IMcsOrderWorkflowRefObj {
  resourceDescription: string;
  serviceId?: string;
  ticketServiceId?: string;
  serverId?: string;
}

export class McsOrderWorkflow extends McsApiJobRequestBase<IMcsOrderWorkflowRefObj> {
  @JsonProperty({
    serializer: OrderWorkflowActionSerialization,
    deserializer: OrderWorkflowActionSerialization
  })
  public state: OrderWorkflowAction = undefined;

  @JsonProperty()
  public approvers?: string[] = undefined;
}
