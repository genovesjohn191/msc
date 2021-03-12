import { WorkflowType } from '@app/models';
import { managementToolsRemoveCvmForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class ManagementToolsRemoveCvmWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.ManagementToolsRemoveCvm,
    title: 'Remove CVM from Management Tools',
    form: managementToolsRemoveCvmForm
  };
}