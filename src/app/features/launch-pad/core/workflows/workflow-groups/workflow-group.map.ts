import { Type } from '@angular/core';

import { WorkflowGroupId } from './workflow-group-type.enum';
import {
  ChangeVmWorkflowGroup,
  ProvisionVmWorkflowGroup
} from '.';
import { WorkflowGroup } from '../workflow-group.interface';
import { ProvisionAvWorkflowGroup } from './provision-av-workflow';

// Workflow: Assign IDs to workflow groups
export const workflowGroupMap: Map<WorkflowGroupId, Type<WorkflowGroup>> = new Map([
  [ WorkflowGroupId.ProvisionVm, ProvisionVmWorkflowGroup ],
  [ WorkflowGroupId.ChangeVm, ChangeVmWorkflowGroup ],
  [ WorkflowGroupId.AddAntiVirus, ProvisionAvWorkflowGroup ]
]);
