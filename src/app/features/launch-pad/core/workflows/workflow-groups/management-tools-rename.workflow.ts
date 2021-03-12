import { WorkflowType } from '@app/models';
import { renameInManagementToolsForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsRenameWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsRename,
    title: 'Rename in Management Tools',
    form: renameInManagementToolsForm
  };
}