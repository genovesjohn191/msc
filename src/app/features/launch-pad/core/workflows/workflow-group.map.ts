import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-groups/workflow-group-type.enum';
import {
  ChangeVmWorkflowGroup,
  ProvisionVmWorkflowGroup
} from './workflow-groups';
import { WorkflowGroup } from './workflow-group.interface';
import { ProvisionAvWorkflowGroup } from './workflow-groups/provision-av-workflow';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.ProvisionVm, ProvisionVmWorkflowGroup ],
  [ WorkflowGroupId.ChangeVm, ChangeVmWorkflowGroup ],
  [ WorkflowGroupId.AddAntiVirus, ProvisionAvWorkflowGroup ]
]);
