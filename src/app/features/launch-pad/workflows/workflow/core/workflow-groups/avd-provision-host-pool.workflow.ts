import { ProductType, WorkflowType } from '@app/models';
import { provisionAvdHostPoolForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class AvdProvisionHostPoolWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.AvdProvisionHostPool,
    crispProductType: ProductType.AzureVirtualDesktop,
    title: 'Provision AVD Host Pool',
    form: provisionAvdHostPoolForm
  };
}