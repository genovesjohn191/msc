import { WorkflowType } from '@app/models';
import { updateInManagementToolsForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsUpdateWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsUpdate,
    title: 'Update in Management Tools',
    form: updateInManagementToolsForm
  };
}