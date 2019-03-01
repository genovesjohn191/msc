import {
  McsOrderWorkflow,
  McsOrderCreate
} from '@app/models';

export class McsOrderRequest {
  public workflowDetails: McsOrderWorkflow;
  public orderDetails: McsOrderCreate;

  constructor() {
    this.orderDetails = new McsOrderCreate();
    this.workflowDetails = new McsOrderWorkflow();
  }
}
