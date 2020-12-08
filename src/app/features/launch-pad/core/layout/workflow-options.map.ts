import { WorkflowSelectorItem } from './workflow-selector/workflow-selector.service';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, string> = new Map([

  [WorkflowGroupId.ProvisionVirtualDataCentreVmInstance, 'Create a new virtual data centre VM instance.'],
  [WorkflowGroupId.AddToManagementToolsCvm, 'Add To Management Tools.']
]);