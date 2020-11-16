import { WorkflowSelectorItem } from './workflow-selector/workflow-selector.service';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, WorkflowSelectorItem> = new Map([
  [WorkflowGroupId.ProvisionVirtualMachine, {
    id: WorkflowGroupId.ProvisionVirtualMachine,
    name: 'Provision VM',
    description: 'Create a new virtual machine.'
  }]
]);
