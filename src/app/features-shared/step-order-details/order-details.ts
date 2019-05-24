import { OrderWorkflowAction } from '@app/models';

export class OrderDetails {
  public description: string;
  public contractDurationMonths: number;
  public workflowAction: OrderWorkflowAction;
  public billingEntityId: number;
  public billingSiteId: number;
  public billingCostCentreId: number;
}
