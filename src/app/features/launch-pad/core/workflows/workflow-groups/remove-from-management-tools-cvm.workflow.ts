import { WorkflowType } from '@app/models';
import { removeFromManagementToolsForm } from '../forms/remove-from-management-tools-cvm.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class RemoveFromManagementToolsCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.RemoveFromManagementToolsCvm,
    title: 'Remove CVM from Management Tools',
    form: removeFromManagementToolsForm
  };
}