import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  AddToManagementToolsCvmWorkflowGroup,
  ProvisionVirtualDataCentreVmInstanceWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.ProvisionVirtualDataCentreVmInstance, ProvisionVirtualDataCentreVmInstanceWorkflowGroup ],
  [ WorkflowGroupId.AddToManagementToolsCvm, AddToManagementToolsCvmWorkflowGroup ]
]);
