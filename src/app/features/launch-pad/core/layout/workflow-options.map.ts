import { WorkflowSelectorItem } from './workflow-selector/workflow-selector.service';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, WorkflowSelectorItem> = new Map([
  [WorkflowGroupId.ProvisionVirtualDataCentreVmInstance, {
    id: WorkflowGroupId.ProvisionVirtualDataCentreVmInstance,
    name: 'Provision Virtual Data Centre VM Instance',
    description: 'Create a new virtual data centre VM instance.'
  }]
]);
