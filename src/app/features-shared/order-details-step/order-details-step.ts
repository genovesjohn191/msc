import {
  OrderWorkflowAction,
  McsBilling,
  McsBillingCostCentre,
  McsBillingSite
} from '@app/models';

export class OrderDetails {
  public description: string;
  public contractDuration: number;
  public workflowAction: OrderWorkflowAction;
  public billingEntity: McsBilling;
  public billingSite: McsBillingSite;
  public billingCostCentre: McsBillingCostCentre;
}
