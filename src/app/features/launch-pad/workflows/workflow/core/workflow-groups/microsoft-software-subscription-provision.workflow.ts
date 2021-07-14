import {
  ProductType,
  WorkflowType
} from '@app/models';
import { microsoftSoftwareSubscriptionProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class MicrosoftSoftwareSubscriptionProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.MicrosoftSoftwareSubscriptionProvision,
    crispProductType: ProductType.AzureSoftwareSubscription,
    title: 'Provision Microsoft Software Subscription',
    form: microsoftSoftwareSubscriptionProvisionForm
  };
}