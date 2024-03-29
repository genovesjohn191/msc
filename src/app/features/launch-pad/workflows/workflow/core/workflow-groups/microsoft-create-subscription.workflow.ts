import {
  ProductType,
  WorkflowType
} from '@app/models';
import { microsoftCreateSubscriptionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class MicrosoftCreateSubscriptionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.MicrosoftCreateSubscription,
    crispProductType: ProductType.AzureProductConsumption,
    title: 'Create Microsoft Subscription',
    form: microsoftCreateSubscriptionForm
  };
}