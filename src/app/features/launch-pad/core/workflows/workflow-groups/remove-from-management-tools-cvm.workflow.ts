import { ProductType, WorkflowType } from '@app/models';
import { removeFromManagementToolsForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class RemoveFromManagementToolsCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.RemoveFromManagementToolsCvm,
    crispProductType: ProductType.VirtualDataCentreVmInstance,
    title: 'Remove CVM from Management Tools',
    form: removeFromManagementToolsForm
  };
}