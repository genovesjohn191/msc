import { JsonProperty } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../mcs-api-job-request-base';
import {
  OrderWorkflowAction,
  OrderWorkflowActionSerialization
} from '../enumerations/order-workflow-action.enum';

export class McsOrderWorkflow extends McsApiJobRequestBase {
  @JsonProperty({
    type: OrderWorkflowAction,
    serializer: OrderWorkflowActionSerialization,
    deserializer: OrderWorkflowActionSerialization
  })
  public action: OrderWorkflowAction;

  constructor() {
    super();
    this.action = undefined;
  }
}
