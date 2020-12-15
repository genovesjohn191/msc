import { WorkflowType } from '@app/models';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class RemoveFromManagementToolsCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.RemoveFromManagementToolsCvm,
    title: 'Remove CVM from Management Tools',
    form: { config: [] }
  };
}