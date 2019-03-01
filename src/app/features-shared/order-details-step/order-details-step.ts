import { OrderWorkflowAction } from '@app/models';

export class OrderDetails {
  public description: string;
  public contractDuration: number;
  public workflowAction: OrderWorkflowAction;

  // TODO: Need to confirm the actual payload for billing
  public billingEntity: string;
  public billingSite: string;
  public billingCustomCenter: string;
}
